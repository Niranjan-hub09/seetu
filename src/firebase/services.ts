import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './config';
import { Member, Seetu, Payment, Maturity, AppSettings } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const DEFAULT_SETTINGS: AppSettings = {
  cheettuName: 'ஜோதி சீட்டு (Jothi Cheettu)',
  organizerName: 'Jothi Cheettu Organizer',
  mobileNumber: '9840123456',
  adminEmail: 'itsniranjan2007@gmail.com',
  upiId: 'jothicheettu@okhdfcbank',
  gpayNumber: '9840123456',
  qrCodeUrl: '',
  weeklyAmount: 100,
  totalWeeks: 51,
  defaultExtraAmount: 300,
  businessAddress: 'Bazaar Street, Madurai, Tamil Nadu',
  adminPasscode: '1234',
  disclaimer:
    'Jothi Cheettu is exclusively designed for personal & family weekly savings record keeping. It does not provide commercial banking, chit fund, or investment financial services.',
};

// ----------------- SECONDARY AUTH FOR ADMIN CREATING MEMBERS -----------------
export async function createMemberAuthAccount(
  email: string,
  pass: string,
  allowFallback = false
): Promise<{ uid: string; isFirebaseAuth: boolean }> {
  try {
    const secondaryAppName = 'JothiCheettuSecondaryAuthApp';
    let secondaryApp = getApps().find((app) => app.name === secondaryAppName);
    if (!secondaryApp) {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    }
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), pass);
    const uid = cred.user.uid;
    // Sign out secondary so it doesn't affect anything
    await signOut(secondaryAuth);
    return { uid, isFirebaseAuth: true };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/operation-not-allowed' && allowFallback) {
      const fallbackUid = `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      return { uid: fallbackUid, isFirebaseAuth: false };
    }
    throw error;
  }
}

// ----------------- SETTINGS -----------------
export async function fetchSettings(): Promise<AppSettings> {
  const path = 'settings';
  try {
    const docRef = doc(db, path, 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        cheettuName: data.cheettuName || data.chithiName || DEFAULT_SETTINGS.cheettuName,
      } as AppSettings;
    }
    // initialize defaults
    await setDoc(docRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, `${path}/config`);
    } catch {
      return DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const path = 'settings';
  try {
    const docRef = doc(db, path, 'config');
    await setDoc(docRef, {
      ...settings,
      cheettuName: settings.cheettuName || DEFAULT_SETTINGS.cheettuName,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/config`);
  }
}

// ----------------- MEMBERS (ADMIN) -----------------
export function subscribeMembers(onUpdate: (members: Member[]) => void, onError?: (err: unknown) => void) {
  const path = 'members';
  const q = query(collection(db, path), orderBy('memberId', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Member[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Member, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------- MEMBER SELF (INDIVIDUAL DASHBOARD) -----------------
export function subscribeMemberSelf(
  uid: string,
  onUpdate: (member: Member | null) => void,
  onError?: (err: unknown) => void
) {
  const path = 'members';
  const q = query(collection(db, path), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        onUpdate({ id: d.id, ...(d.data() as Omit<Member, 'id'>) });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createMember(memberData: Omit<Member, 'id'>): Promise<string> {
  const path = 'members';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...memberData,
      role: 'member',
      status: memberData.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<void> {
  const path = 'members';
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function deleteMemberAndAssociated(
  memberDocId: string,
  memberId: string
): Promise<void> {
  const path = 'members';
  try {
    // delete member document
    await deleteDoc(doc(db, path, memberDocId));

    // delete member's seetus
    const seetusSnap = await getDocs(collection(db, 'seetus'));
    for (const d of seetusSnap.docs) {
      const data = d.data();
      if (data.memberId === memberId) {
        await deleteDoc(doc(db, 'seetus', d.id));
      }
    }

    // delete member's payments
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    for (const d of paymentsSnap.docs) {
      const data = d.data();
      if (data.memberId === memberId) {
        await deleteDoc(doc(db, 'payments', d.id));
      }
    }

    // delete member's maturities
    const matSnap = await getDocs(collection(db, 'maturities'));
    for (const d of matSnap.docs) {
      const data = d.data();
      if (data.memberId === memberId) {
        await deleteDoc(doc(db, 'maturities', d.id));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${memberDocId}`);
  }
}

// ----------------- SEETUS -----------------
export function subscribeSeetus(onUpdate: (seetus: Seetu[]) => void, onError?: (err: unknown) => void) {
  const path = 'seetus';
  const q = query(collection(db, path), orderBy('seetuId', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Seetu[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Seetu, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeSeetusForMember(
  uid: string,
  onUpdate: (seetus: Seetu[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'seetus';
  const q = query(collection(db, path), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Seetu[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Seetu, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createSeetu(seetuData: Omit<Seetu, 'id'>): Promise<string> {
  const path = 'seetus';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...seetuData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function updateSeetu(id: string, updates: Partial<Seetu>): Promise<void> {
  const path = 'seetus';
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

// ----------------- PAYMENTS -----------------
export function subscribePayments(onUpdate: (payments: Payment[]) => void, onError?: (err: unknown) => void) {
  const path = 'payments';
  const q = query(collection(db, path), orderBy('paymentDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Payment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Payment, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribePaymentsForMember(
  uid: string,
  onUpdate: (payments: Payment[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'payments';
  const q = query(collection(db, path), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Payment[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Payment, 'id'>),
        }))
        .sort((a, b) => b.weekNumber - a.weekNumber);
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function recordPaymentEntry(
  paymentData: Omit<Payment, 'id'>,
  seetuDocId: string,
  currentSeetu: Seetu,
  defaultExtraAmount = 300
): Promise<string> {
  const path = 'payments';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...paymentData,
      uid: currentSeetu.uid || '',
      createdAt: new Date().toISOString(),
    });

    // Automatically recalculate Seetu weeks & amounts
    const newWeeksPaid = Math.min(currentSeetu.totalWeeks, currentSeetu.weeksPaid + 1);
    const newWeeksRemaining = Math.max(0, currentSeetu.totalWeeks - newWeeksPaid);
    const newAmountPaid = currentSeetu.amountPaid + paymentData.amount;
    const newAmountRemaining = Math.max(0, currentSeetu.totalExpectedAmount - newAmountPaid);
    const isCompleted = newWeeksPaid >= currentSeetu.totalWeeks;

    await updateSeetu(seetuDocId, {
      weeksPaid: newWeeksPaid,
      weeksRemaining: newWeeksRemaining,
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: isCompleted ? 'Completed' : 'Active',
      updatedAt: new Date().toISOString(),
    });

    // If completed 51 weeks, create or update Maturity record
    if (isCompleted) {
      await registerMaturityRecord({
        seetuId: currentSeetu.seetuId,
        memberId: currentSeetu.memberId,
        uid: currentSeetu.uid || '',
        memberName: currentSeetu.memberName,
        memberMobile: currentSeetu.memberMobile,
        memberEmail: currentSeetu.memberEmail || '',
        totalContribution: newAmountPaid,
        extraInterestAmount: currentSeetu.extraInterestAmount || defaultExtraAmount,
        maturityAmount: newAmountPaid + (currentSeetu.extraInterestAmount || defaultExtraAmount),
        maturityDate: currentSeetu.maturityDate,
        status: 'Eligible',
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function deletePaymentEntry(
  paymentId: string,
  seetuDocId: string,
  currentSeetu: Seetu,
  paymentAmount: number
): Promise<void> {
  const path = 'payments';
  try {
    await deleteDoc(doc(db, path, paymentId));

    // Rollback Seetu metrics
    const newWeeksPaid = Math.max(0, currentSeetu.weeksPaid - 1);
    const newWeeksRemaining = Math.min(currentSeetu.totalWeeks, currentSeetu.totalWeeks - newWeeksPaid);
    const newAmountPaid = Math.max(0, currentSeetu.amountPaid - paymentAmount);
    const newAmountRemaining = Math.max(0, currentSeetu.totalExpectedAmount - newAmountPaid);

    await updateSeetu(seetuDocId, {
      weeksPaid: newWeeksPaid,
      weeksRemaining: newWeeksRemaining,
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: 'Active',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${paymentId}`);
  }
}

// ----------------- MATURITIES -----------------
export function subscribeMaturities(onUpdate: (maturities: Maturity[]) => void, onError?: (err: unknown) => void) {
  const path = 'maturities';
  const q = query(collection(db, path), orderBy('maturityDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Maturity[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Maturity, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeMaturitiesForMember(
  uid: string,
  onUpdate: (maturities: Maturity[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'maturities';
  const q = query(collection(db, path), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Maturity[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Maturity, 'id'>),
      }));
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function registerMaturityRecord(
  data: Omit<Maturity, 'id' | 'maturityId' | 'createdAt'>
): Promise<string> {
  const path = 'maturities';
  try {
    const snap = await getDocs(collection(db, path));
    const existing = snap.docs.find((d) => d.data().seetuId === data.seetuId);
    if (existing) {
      await updateDoc(doc(db, path, existing.id), {
        ...data,
      });
      return existing.id;
    }

    const docRef = await addDoc(collection(db, path), {
      ...data,
      maturityId: `MAT-${data.seetuId}`,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function settleMaturityPayout(
  maturityDocId: string,
  seetuId: string,
  notes?: string
): Promise<void> {
  const path = 'maturities';
  try {
    await updateDoc(doc(db, path, maturityDocId), {
      status: 'Settled',
      settledDate: new Date().toISOString().split('T')[0],
      settledNotes: notes || 'Settled with member',
    });

    // Update seetu status to Matured
    const seetusSnap = await getDocs(collection(db, 'seetus'));
    const seetuDoc = seetusSnap.docs.find((d) => d.data().seetuId === seetuId);
    if (seetuDoc) {
      await updateDoc(doc(db, 'seetus', seetuDoc.id), {
        status: 'Matured',
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${maturityDocId}`);
  }
}

// ----------------- DATABASE WIPE / PURGE DUMMY DATA -----------------
export async function clearAllData(): Promise<void> {
  const collections = ['members', 'seetus', 'payments', 'maturities'];
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, col, d.id));
      }
    } catch (e) {
      console.warn(`Could not clear ${col}`, e);
    }
  }
}

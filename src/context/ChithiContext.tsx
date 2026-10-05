import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Member, Seetu, Payment, Maturity, AppSettings, PendingMemberRecord } from '../types';
import {
  subscribeMembers,
  subscribeMemberSelf,
  subscribeSeetus,
  subscribeSeetusForMember,
  subscribePayments,
  subscribePaymentsForMember,
  subscribeMaturities,
  subscribeMaturitiesForMember,
  createMember,
  updateMember,
  deleteMemberAndAssociated,
  createSeetu,
  recordPaymentEntry,
  deletePaymentEntry,
  settleMaturityPayout,
  saveSettings,
  clearAllData,
  createMemberAuthAccount,
  DEFAULT_SETTINGS,
} from '../firebase/services';
import { useAuth } from './AuthContext';

interface ChithiContextType {
  members: Member[];
  seetus: Seetu[];
  payments: Payment[];
  maturities: Maturity[];
  settings: AppSettings;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  loadingData: boolean;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Selected modals
  selectedMemberIdForProfile: string | null;
  setSelectedMemberIdForProfile: (id: string | null) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  paymentModalPrefill: { memberId?: string; seetuId?: string; weekNumber?: number } | null;
  openPaymentModal: (prefill?: { memberId?: string; seetuId?: string; weekNumber?: number }) => void;
  closePaymentModal: () => void;

  activeReceiptPayment: Payment | null;
  openReceiptModal: (payment: Payment) => void;
  closeReceiptModal: () => void;

  isGPayModalOpen: boolean;
  setIsGPayModalOpen: (open: boolean) => void;

  // Metrics
  stats: {
    totalMembers: number;
    totalSeetus: number;
    totalAmountCollected: number;
    thisWeekCollection: number;
    totalPendingAmount: number;
    completedSeetusCount: number;
    upcomingMaturitiesCount: number;
    currentSchemeWeek: number;
  };

  pendingMembers: PendingMemberRecord[];

  // Actions
  addNewMember: (
    data: {
      fullName: string;
      mobileNumber: string;
      email: string;
      address: string;
      numberOfSeetus: number;
      joiningDate: string;
      password: string;
      notes?: string;
    },
    options?: { allowFallback?: boolean }
  ) => Promise<{ memberId: string; isFirebaseAuth: boolean }>;
  editMember: (id: string, updates: Partial<Member>) => Promise<void>;
  removeMember: (docId: string, memberId: string) => Promise<void>;

  recordWeeklyPayment: (paymentData: {
    memberId: string;
    memberName: string;
    seetuId: string;
    weekNumber: number;
    paymentDate: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
  }) => Promise<Payment | null>;
  removePayment: (payment: Payment) => Promise<void>;

  settleMaturity: (maturityDocId: string, seetuId: string, notes?: string) => Promise<void>;
  updateAppSettings: (newSettings: AppSettings) => Promise<void>;
  clearDatabase: () => Promise<void>;

  // WhatsApp helper
  sendWhatsAppMessage: (mobileNumber: string, message: string) => void;
}

const ChithiContext = createContext<ChithiContextType | undefined>(undefined);

export const ChithiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isMember, user, currentMemberProfile, settings: authSettings, refreshSettings } =
    useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [seetus, setSeetus] = useState<Seetu[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maturities, setMaturities] = useState<Maturity[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'ta'>(() => {
    return (localStorage.getItem('jothi_lang') as 'en' | 'ta') || 'en';
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedMemberIdForProfile, setSelectedMemberIdForProfile] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalPrefill, setPaymentModalPrefill] = useState<{
    memberId?: string;
    seetuId?: string;
    weekNumber?: number;
  } | null>(null);

  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [isGPayModalOpen, setIsGPayModalOpen] = useState(false);

  const settings = authSettings || DEFAULT_SETTINGS;

  const handleLanguageChange = (l: 'en' | 'ta') => {
    setLanguage(l);
    localStorage.setItem('jothi_lang', l);
  };

  // Subscriptions to Firestore depending on role
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingData(false);
      setMembers([]);
      setSeetus([]);
      setPayments([]);
      setMaturities([]);
      return;
    }

    setLoadingData(true);
    let unsubMembers: (() => void) | undefined;
    let unsubSeetus: (() => void) | undefined;
    let unsubPayments: (() => void) | undefined;
    let unsubMaturities: (() => void) | undefined;

    if (isAdmin) {
      // Admin sees ALL records
      try {
        unsubMembers = subscribeMembers((list) => {
          setMembers(list);
        });
        unsubSeetus = subscribeSeetus((list) => {
          setSeetus(list);
        });
        unsubPayments = subscribePayments((list) => {
          setPayments(list);
          setLoadingData(false);
        });
        unsubMaturities = subscribeMaturities((list) => {
          setMaturities(list);
        });
      } catch (err) {
        console.warn('Admin subscription error', err);
        setLoadingData(false);
      }
    } else if (isMember && (user?.uid || currentMemberProfile?.uid)) {
      // Member sees ONLY their own records
      const memberUid = user?.uid || currentMemberProfile?.uid || '';
      try {
        unsubMembers = subscribeMemberSelf(memberUid, (member) => {
          setMembers(member ? [member] : []);
        });
        unsubSeetus = subscribeSeetusForMember(memberUid, (list) => {
          setSeetus(list);
        });
        unsubPayments = subscribePaymentsForMember(memberUid, (list) => {
          setPayments(list);
          setLoadingData(false);
        });
        unsubMaturities = subscribeMaturitiesForMember(memberUid, (list) => {
          setMaturities(list);
        });
      } catch (err) {
        console.warn('Member subscription error', err);
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubSeetus) unsubSeetus();
      if (unsubPayments) unsubPayments();
      if (unsubMaturities) unsubMaturities();
    };
  }, [isAuthenticated, isAdmin, isMember, user?.uid, currentMemberProfile?.uid]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalSeetus = seetus.length;
    const totalAmountCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeekCollection = payments
      .filter((p) => new Date(p.paymentDate) >= sevenDaysAgo)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalPendingAmount = seetus.reduce((acc, s) => acc + (s.amountRemaining || 0), 0);
    const completedSeetusCount = seetus.filter(
      (s) => s.status === 'Completed' || s.status === 'Matured' || s.weeksPaid >= s.totalWeeks
    ).length;

    const upcomingMaturitiesCount = seetus.filter(
      (s) => s.weeksPaid >= Math.max(1, (settings.totalWeeks || 51) - 6)
    ).length;

    const currentSchemeWeek = payments.length > 0 ? Math.max(...payments.map((p) => p.weekNumber || 1)) : 1;

    return {
      totalMembers,
      totalSeetus,
      totalAmountCollected,
      thisWeekCollection,
      totalPendingAmount,
      completedSeetusCount,
      upcomingMaturitiesCount,
      currentSchemeWeek,
    };
  }, [members, seetus, payments, settings.totalWeeks]);

  // Pending members calculation
  const pendingMembers = useMemo<PendingMemberRecord[]>(() => {
    const weeklyAmt = settings.weeklyAmount || 100;
    const currentMaxWeek = Math.min(settings.totalWeeks || 51, Math.max(stats.currentSchemeWeek, 1));

    return members
      .map((member) => {
        const memberSeetus = seetus.filter((s) => s.memberId === member.memberId);
        const expectedWeeklyAmount = member.numberOfSeetus * weeklyAmt;
        const totalPaid = memberSeetus.reduce((acc, s) => acc + (s.amountPaid || 0), 0);

        let totalPendingAmount = 0;
        let pendingWeeksCount = 0;

        for (const s of memberSeetus) {
          if (s.status !== 'Completed' && s.status !== 'Matured') {
            const expectedPaidToDate = Math.min(currentMaxWeek, s.totalWeeks) * s.weeklyAmount;
            const arrears = Math.max(0, expectedPaidToDate - s.amountPaid);
            totalPendingAmount += arrears;
            const unpaidWeeks = Math.max(0, currentMaxWeek - s.weeksPaid);
            if (unpaidWeeks > pendingWeeksCount) {
              pendingWeeksCount = unpaidWeeks;
            }
          }
        }

        const memberPayments = payments.filter((p) => p.memberId === member.memberId);
        const lastPaymentDate = memberPayments[0]?.paymentDate;

        return {
          member,
          seetus: memberSeetus,
          expectedWeeklyAmount,
          totalPaid,
          totalPendingAmount,
          pendingWeeksCount,
          lastPaymentDate,
        };
      })
      .filter((rec) => rec.pendingWeeksCount > 0 || rec.totalPendingAmount > 0)
      .sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
  }, [members, seetus, payments, settings.weeklyAmount, settings.totalWeeks, stats.currentSchemeWeek]);

  // Actions
  const addNewMember = async (
    data: {
      fullName: string;
      mobileNumber: string;
      email: string;
      address: string;
      numberOfSeetus: number;
      joiningDate: string;
      password: string;
      notes?: string;
    },
    options?: { allowFallback?: boolean }
  ): Promise<{ memberId: string; isFirebaseAuth: boolean }> => {
    if (!isAdmin) {
      throw new Error('Access Denied: Only Admin can add new members.');
    }

    // 1. Create Firebase Authentication account for the member
    const { uid: memberUid, isFirebaseAuth } = await createMemberAuthAccount(
      data.email,
      data.password,
      options?.allowFallback ?? false
    );

    // 2. Generate Member ID (e.g. M001, M002)
    const existingCount = members.length;
    const memberId = `M${String(existingCount + 1).padStart(3, '0')}`;

    // 3. Store member profile in Firestore with UID
    await createMember({
      memberId,
      uid: memberUid,
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      email: data.email.trim(),
      address: data.address,
      numberOfSeetus: data.numberOfSeetus,
      joiningDate: data.joiningDate,
      role: 'member',
      status: 'Active',
      notes: data.notes || '',
      password: data.password,
      isFirebaseAuth,
      createdAt: new Date().toISOString(),
    });

    // 4. Create Seetu slots with linked UID
    const weeklyAmt = settings.weeklyAmount || 100;
    const totalWeeks = settings.totalWeeks || 51;
    const totalExpected = weeklyAmt * totalWeeks;
    const extraAmt = settings.defaultExtraAmount || 300;

    const currentSeetuCount = seetus.length;
    for (let i = 1; i <= data.numberOfSeetus; i++) {
      const seetuId = `S${String(currentSeetuCount + i).padStart(3, '0')}`;
      const startDate = data.joiningDate;
      const d = new Date(startDate);
      d.setDate(d.getDate() + totalWeeks * 7);
      const maturityDate = d.toISOString().split('T')[0];

      await createSeetu({
        seetuId,
        memberId,
        uid: memberUid,
        memberName: data.fullName,
        memberMobile: data.mobileNumber,
        memberEmail: data.email.trim(),
        weeklyAmount: weeklyAmt,
        totalWeeks,
        totalExpectedAmount: totalExpected,
        weeksPaid: 0,
        weeksRemaining: totalWeeks,
        amountPaid: 0,
        amountRemaining: totalExpected,
        startDate,
        maturityDate,
        extraInterestAmount: extraAmt,
        maturityAmount: totalExpected + extraAmt,
        status: 'Active',
        createdAt: new Date().toISOString(),
      });
    }

    return { memberId, isFirebaseAuth };
  };

  const editMember = async (id: string, updates: Partial<Member>) => {
    if (!isAdmin) throw new Error('Access Denied');
    await updateMember(id, updates);
  };

  const removeMember = async (docId: string, memberId: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    await deleteMemberAndAssociated(docId, memberId);
  };

  const recordWeeklyPayment = async (data: {
    memberId: string;
    memberName: string;
    seetuId: string;
    weekNumber: number;
    paymentDate: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
  }): Promise<Payment | null> => {
    if (!isAdmin) throw new Error('Access Denied: Only Admin can record payments');
    const seetuDoc = seetus.find((s) => s.seetuId === data.seetuId);
    if (!seetuDoc) {
      throw new Error(`Seetu ${data.seetuId} not found`);
    }

    // Check duplicate
    const exists = payments.find(
      (p) => p.seetuId === data.seetuId && p.weekNumber === data.weekNumber
    );
    if (exists) {
      throw new Error(
        `Payment for Seetu ${data.seetuId}, Week ${data.weekNumber} is already recorded on ${exists.paymentDate}. Duplicate entries are prevented.`
      );
    }

    const receiptNo = `RCP-${data.seetuId}-W${String(data.weekNumber).padStart(2, '0')}`;
    const paymentPayload: Omit<Payment, 'id'> = {
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      memberId: data.memberId,
      uid: seetuDoc.uid || '',
      memberName: data.memberName,
      seetuId: data.seetuId,
      weekNumber: data.weekNumber,
      paymentDate: data.paymentDate,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      receiptNo,
      createdAt: new Date().toISOString(),
    };

    const docId = await recordPaymentEntry(
      paymentPayload,
      seetuDoc.id,
      seetuDoc,
      settings.defaultExtraAmount || 300
    );

    const fullPayment: Payment = { id: docId, ...paymentPayload };
    return fullPayment;
  };

  const removePayment = async (payment: Payment) => {
    if (!isAdmin) throw new Error('Access Denied');
    const seetuDoc = seetus.find((s) => s.seetuId === payment.seetuId);
    if (!seetuDoc) return;
    await deletePaymentEntry(payment.id, seetuDoc.id, seetuDoc, payment.amount);
  };

  const settleMaturity = async (maturityDocId: string, seetuId: string, notes?: string) => {
    if (!isAdmin) throw new Error('Access Denied');
    await settleMaturityPayout(maturityDocId, seetuId, notes);
  };

  const updateAppSettings = async (newSettings: AppSettings) => {
    if (!isAdmin) throw new Error('Access Denied');
    await saveSettings(newSettings);
    await refreshSettings();
  };

  const clearDatabase = async () => {
    if (!isAdmin) throw new Error('Access Denied');
    await clearAllData();
  };

  const sendWhatsAppMessage = (mobileNumber: string, message: string) => {
    let clean = mobileNumber.replace(/\D/g, '');
    if (clean.length === 10) {
      clean = `91${clean}`;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openPaymentModal = (prefill?: {
    memberId?: string;
    seetuId?: string;
    weekNumber?: number;
  }) => {
    setPaymentModalPrefill(prefill || null);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentModalPrefill(null);
  };

  const openReceiptModal = (payment: Payment) => {
    setActiveReceiptPayment(payment);
  };

  const closeReceiptModal = () => {
    setActiveReceiptPayment(null);
  };

  return (
    <ChithiContext.Provider
      value={{
        members,
        seetus,
        payments,
        maturities,
        settings,
        language,
        setLanguage: handleLanguageChange,
        loadingData,
        globalSearchQuery,
        setGlobalSearchQuery,

        selectedMemberIdForProfile,
        setSelectedMemberIdForProfile,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        paymentModalPrefill,
        openPaymentModal,
        closePaymentModal,

        activeReceiptPayment,
        openReceiptModal,
        closeReceiptModal,

        isGPayModalOpen,
        setIsGPayModalOpen,

        stats,
        pendingMembers,

        addNewMember,
        editMember,
        removeMember,
        recordWeeklyPayment,
        removePayment,
        settleMaturity,
        updateAppSettings,
        clearDatabase,
        sendWhatsAppMessage,
      }}
    >
      {children}
    </ChithiContext.Provider>
  );
};

export const useChithi = () => {
  const context = useContext(ChithiContext);
  if (!context) {
    throw new Error('useChithi must be used within a ChithiProvider');
  }
  return context;
};

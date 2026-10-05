import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AppSettings, UserRole, Member } from '../types';
import { fetchSettings, DEFAULT_SETTINGS } from '../firebase/services';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  currentMemberProfile: Member | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<{ role: UserRole }>;
  loginAdminWithPasscode: (mobileOrUser: string, passcode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  settings: AppSettings;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('jothi_user_role') as UserRole) || null;
  });
  const [currentMemberProfile, setCurrentMemberProfile] = useState<Member | null>(() => {
    const saved = localStorage.getItem('jothi_member_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const refreshSettings = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  // Determine user role and load member profile
  const syncUserRoleAndProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      // Check if custom organizer admin session exists in localStorage
      const localRole = localStorage.getItem('jothi_user_role') as UserRole;
      if (localRole === 'admin') {
        setUserRole('admin');
      } else {
        setUserRole(null);
        setCurrentMemberProfile(null);
      }
      return;
    }

    const email = firebaseUser.email?.toLowerCase().trim() || '';

    // 1. Check if admin
    if (
      email === 'itsniranjan2007@gmail.com' ||
      email === settings.adminEmail?.toLowerCase().trim()
    ) {
      setUserRole('admin');
      setCurrentMemberProfile(null);
      localStorage.setItem('jothi_user_role', 'admin');
      localStorage.removeItem('jothi_member_profile');
      return;
    }

    // Check if doc exists in admins collection
    try {
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      if (adminDoc.exists()) {
        setUserRole('admin');
        setCurrentMemberProfile(null);
        localStorage.setItem('jothi_user_role', 'admin');
        localStorage.removeItem('jothi_member_profile');
        return;
      }
    } catch {
      // ignore
    }

    // 2. Check if member
    try {
      const q = query(collection(db, 'members'), where('uid', '==', firebaseUser.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const memData = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Member, 'id'>) };
        setUserRole('member');
        setCurrentMemberProfile(memData);
        localStorage.setItem('jothi_user_role', 'member');
        localStorage.setItem('jothi_member_profile', JSON.stringify(memData));
        return;
      }

      // Fallback by email lookup
      if (email) {
        const qEmail = query(collection(db, 'members'), where('email', '==', email));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          const memData = {
            id: snapEmail.docs[0].id,
            ...(snapEmail.docs[0].data() as Omit<Member, 'id'>),
          };
          setUserRole('member');
          setCurrentMemberProfile(memData);
          localStorage.setItem('jothi_user_role', 'member');
          localStorage.setItem('jothi_member_profile', JSON.stringify(memData));
          return;
        }
      }
    } catch (e) {
      console.warn('Could not query member role', e);
    }

    // Default: if email matches organizer or session has admin
    const savedRole = localStorage.getItem('jothi_user_role') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      // Default to member
      setUserRole('member');
    }
  };

  useEffect(() => {
    refreshSettings();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await syncUserRoleAndProfile(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await syncUserRoleAndProfile(cred.user);
    } catch (error) {
      console.error('Google Sign-in failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailPassword = async (
    email: string,
    pass: string
  ): Promise<{ role: UserRole }> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userEmail = cred.user.email?.toLowerCase().trim() || '';

      if (
        userEmail === 'itsniranjan2007@gmail.com' ||
        userEmail === settings.adminEmail?.toLowerCase().trim()
      ) {
        setUserRole('admin');
        setCurrentMemberProfile(null);
        localStorage.setItem('jothi_user_role', 'admin');
        localStorage.removeItem('jothi_member_profile');
        return { role: 'admin' };
      }

      // Member check
      const q = query(collection(db, 'members'), where('uid', '==', cred.user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const mem = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Member, 'id'>) };
        setUserRole('member');
        setCurrentMemberProfile(mem);
        localStorage.setItem('jothi_user_role', 'member');
        localStorage.setItem('jothi_member_profile', JSON.stringify(mem));
        return { role: 'member' };
      }

      // By email
      const qEmail = query(
        collection(db, 'members'),
        where('email', '==', cred.user.email?.trim())
      );
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const mem = {
          id: snapEmail.docs[0].id,
          ...(snapEmail.docs[0].data() as Omit<Member, 'id'>),
        };
        setUserRole('member');
        setCurrentMemberProfile(mem);
        localStorage.setItem('jothi_user_role', 'member');
        localStorage.setItem('jothi_member_profile', JSON.stringify(mem));
        return { role: 'member' };
      }

      // Default fallback
      setUserRole('member');
      localStorage.setItem('jothi_user_role', 'member');
      return { role: 'member' };
    } finally {
      setLoading(false);
    }
  };

  const loginAdminWithPasscode = async (
    mobileOrUser: string,
    passcode: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const currentSettings = await fetchSettings();
      const cleanInput = mobileOrUser.trim().toLowerCase();
      const validPass = (currentSettings.adminPasscode || '1234').trim();

      const isMatch =
        cleanInput === (currentSettings.mobileNumber || '').trim().toLowerCase() ||
        cleanInput === (currentSettings.adminEmail || '').trim().toLowerCase() ||
        cleanInput === 'admin' ||
        cleanInput === 'organizer' ||
        cleanInput === 'jothi' ||
        cleanInput === '9840123456';

      if (passcode.trim() === validPass && isMatch) {
        setUserRole('admin');
        setCurrentMemberProfile(null);
        localStorage.setItem('jothi_user_role', 'admin');
        localStorage.removeItem('jothi_member_profile');
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout issue', e);
    }
    setUser(null);
    setUserRole(null);
    setCurrentMemberProfile(null);
    localStorage.removeItem('jothi_user_role');
    localStorage.removeItem('jothi_member_profile');
  };

  const isAuthenticated = Boolean(user || userRole);
  const isAdmin = userRole === 'admin';
  const isMember = userRole === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        currentMemberProfile,
        isAuthenticated,
        isAdmin,
        isMember,
        loading,
        loginWithGoogle,
        loginWithEmailPassword,
        loginAdminWithPasscode,
        logout,
        settings,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

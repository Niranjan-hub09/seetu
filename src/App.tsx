import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChithiProvider, useChithi } from './context/ChithiContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MembersPage } from './components/MembersPage';
import { SeetuPage } from './components/SeetuPage';
import { PaymentHistoryPage } from './components/PaymentHistoryPage';
import { PendingPaymentsPage } from './components/PendingPaymentsPage';
import { MaturityPage } from './components/MaturityPage';
import { FinancialSummaryPage } from './components/FinancialSummaryPage';
import { SettingsPage } from './components/SettingsPage';
import { MemberDashboard } from './components/MemberDashboard';
import { WeeklyPaymentModal } from './components/WeeklyPaymentModal';
import { AddMemberModal } from './components/AddMemberModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { ReceiptModal } from './components/ReceiptModal';
import { GPayModal } from './components/GPayModal';
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, isMember, loading } = useAuth();
  const { openPaymentModal } = useChithi();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">
          Loading Jothi Cheettu...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Member-only view (Strict Member Data Privacy & Security)
  if (isMember && !isAdmin) {
    return (
      <>
        <MemberDashboard />
        <ReceiptModal />
      </>
    );
  }

  // Admin View (Complete Control)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
            />
          )}
          {activeTab === 'members' && (
            <MembersPage onOpenAddMember={() => setIsAddMemberOpen(true)} />
          )}
          {activeTab === 'seetus' && <SeetuPage />}
          {activeTab === 'paymentHistory' && <PaymentHistoryPage />}
          {activeTab === 'pending' && <PendingPaymentsPage />}
          {activeTab === 'maturity' && <MaturityPage />}
          {activeTab === 'summary' && <FinancialSummaryPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for on-the-go admin access */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-1 p-1.5 transition cursor-pointer ${
            activeTab === 'members' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Members</span>
        </button>

        {/* Center Floating Quick Pay Button */}
        <button
          onClick={() => openPaymentModal()}
          className="flex flex-col items-center -mt-5 p-2 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('seetus')}
          className={`flex flex-col items-center gap-1 p-1.5 transition cursor-pointer ${
            activeTab === 'seetus' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Seetus</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex flex-col items-center gap-1 p-1.5 transition cursor-pointer ${
            activeTab === 'pending' ? 'text-amber-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span>Pending</span>
        </button>
      </nav>

      {/* Global Modals (Admin) */}
      <WeeklyPaymentModal />
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
      <MemberProfileModal />
      <ReceiptModal />
      <GPayModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ChithiProvider>
        <MainLayout />
      </ChithiProvider>
    </AuthProvider>
  );
}

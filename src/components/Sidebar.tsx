import React from 'react';
import { useChithi } from '../context/ChithiContext';
import { translations } from '../utils/translations';
import {
  LayoutDashboard,
  Users,
  Layers,
  CircleDollarSign,
  History,
  AlertCircle,
  Gift,
  BarChart3,
  Settings,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { language, stats, pendingMembers, openPaymentModal } = useChithi();
  const t = translations[language];

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'members',
      label: t.members,
      icon: Users,
      badge: stats.totalMembers > 0 ? stats.totalMembers : null,
    },
    {
      id: 'seetus',
      label: t.seetuDetails,
      icon: Layers,
      badge: stats.totalSeetus > 0 ? stats.totalSeetus : null,
    },
    {
      id: 'paymentHistory',
      label: t.paymentHistory,
      icon: History,
      badge: null,
    },
    {
      id: 'pending',
      label: t.pendingPayments,
      icon: AlertCircle,
      badge: pendingMembers.length > 0 ? pendingMembers.length : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'maturity',
      label: t.maturityDiwali,
      icon: Gift,
      badge: stats.upcomingMaturitiesCount > 0 ? stats.upcomingMaturitiesCount : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'summary',
      label: t.financialSummary,
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: t.settings,
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="p-4 hidden lg:block">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
              <span>Collection Progress</span>
              <span>Week {stats.currentSchemeWeek} / 51</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((stats.currentSchemeWeek / 51) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-emerald-700/80 mt-1.5 font-medium">
              {Math.round((stats.currentSchemeWeek / 51) * 100)}% of 51-week cycle
            </p>
          </div>
        </div>

        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      item.badgeColor ||
                      (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom disclaimer notice */}
      <div className="p-4 m-3 bg-slate-100 rounded-2xl border border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Record Keeping Only</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          This system is maintained by the organizer exclusively for local record keeping. No online deposit or banking service.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white h-full shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};

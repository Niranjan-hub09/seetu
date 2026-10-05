import React, { useState, useRef, useEffect } from 'react';
import { useChithi } from '../context/ChithiContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import {
  Search,
  PlusCircle,
  QrCode,
  LogOut,
  Languages,
  User,
  Menu,
  X,
  CreditCard,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, setActiveTab }) => {
  const {
    settings,
    language,
    setLanguage,
    members,
    seetus,
    openPaymentModal,
    setSelectedMemberIdForProfile,
    setIsGPayModalOpen,
  } = useChithi();
  const { logout } = useAuth();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members and seetus
  const matchingMembers = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.mobileNumber.includes(searchQuery) ||
          m.memberId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const matchingSeetus = searchQuery.trim()
    ? seetus.filter(
        (s) =>
          s.seetuId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.memberMobile.includes(searchQuery)
      )
    : [];

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberIdForProfile(memberId);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSelectSeetu = (seetuId: string, memberId: string) => {
    setSelectedMemberIdForProfile(memberId);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-slate-800 leading-tight">
                  {settings.cheettuName.split('(')[0] || 'Jothi Cheettu'}
                </h1>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  ₹{settings.weeklyAmount || 100}/wk • {settings.totalWeeks || 51} Weeks Scheme
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto z-50">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span>Search Results</span>
                  <span>
                    {matchingMembers.length} Members, {matchingSeetus.length} Seetus
                  </span>
                </div>

                {matchingMembers.length === 0 && matchingSeetus.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No member or seetu found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}

                {/* Members list */}
                {matchingMembers.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                      Members
                    </p>
                    {matchingMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m.memberId)}
                        className="px-3 py-2.5 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800 flex items-center gap-2">
                            <span>{m.fullName}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-mono">
                              {m.memberId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {m.mobileNumber} • {m.numberOfSeetus} Seetus (₹{m.numberOfSeetus * (settings.weeklyAmount || 100)}/wk)
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Seetus list */}
                {matchingSeetus.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                      Seetus
                    </p>
                    {matchingSeetus.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSeetu(s.seetuId, s.memberId)}
                        className="px-3 py-2 rounded-xl hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                            <span className="font-mono text-emerald-700 font-bold">{s.seetuId}</span>
                            <span>• {s.memberName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.weeksPaid}/{s.totalWeeks} Wks Paid • Balance: ₹{s.amountRemaining}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            s.status === 'Completed' || s.status === 'Matured'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Quick Record Payment Button */}
            <button
              onClick={() => openPaymentModal()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.weeklyPayment}</span>
            </button>

            {/* GPay / UPI Button */}
            <button
              onClick={() => setIsGPayModalOpen(true)}
              className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="GPay / UPI Payment Info"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">GPay / QR</span>
            </button>

            {/* Language toggle: English / தமிழ் */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Toggle Language (English / தமிழ்)"
            >
              <Languages className="w-4 h-4 text-slate-600" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Organizer Profile & Logout */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Sign out of Organizer Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

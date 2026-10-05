import React from 'react';
import { useChithi } from '../context/ChithiContext';
import { translations, formatINR } from '../utils/translations';
import {
  Users,
  Layers,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Gift,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  MessageCircle,
  Sparkles,
  Calendar,
  Wallet,
  UserPlus,
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenAddMember: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onOpenAddMember }) => {
  const {
    language,
    stats,
    members,
    payments,
    pendingMembers,
    openPaymentModal,
    openReceiptModal,
    sendWhatsAppMessage,
    settings,
  } = useChithi();
  const t = translations[language];

  const recentPayments = payments.slice(0, 5);
  const urgentPending = pendingMembers.slice(0, 4);

  const weeklySchemeRate = Math.min(100, Math.round((stats.currentSchemeWeek / 51) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-40 h-40 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{settings.cheettuName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ta' ? 'ஜோதி சீட்டு முகப்பு' : 'Jothi Cheettu Admin Dashboard'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              1 Seetu = ₹{settings.weeklyAmount || 100}/week • Total 51 Weeks • Maturity = ₹
              {(settings.weeklyAmount || 100) * (settings.totalWeeks || 51) +
                (settings.defaultExtraAmount || 300)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openPaymentModal()}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>{t.quickPayment}</span>
            </button>
            <button
              onClick={onOpenAddMember}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/15 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>+ Add New Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Display Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <div
          onClick={() => setActiveTab('members')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalMembers}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalMembers}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active participants</p>
        </div>

        {/* Total Seetus */}
        <div
          onClick={() => setActiveTab('seetus')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalSeetus}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalSeetus}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Weekly commit: {formatINR(stats.totalSeetus * (settings.weeklyAmount || 100))}
          </p>
        </div>

        {/* Total Amount Collected */}
        <div
          onClick={() => setActiveTab('paymentHistory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {t.totalCollected}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatINR(stats.totalAmountCollected)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            From {payments.length} recorded payments
          </p>
        </div>

        {/* This Week Collection */}
        <div
          onClick={() => setActiveTab('paymentHistory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.thisWeekCollection}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">
            {formatINR(stats.thisWeekCollection)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Past 7 days collected</p>
        </div>

        {/* Pending Amount */}
        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              {t.pendingAmount}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {formatINR(stats.totalPendingAmount)}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {pendingMembers.length} members with arrears
          </p>
        </div>

        {/* Completed Seetus */}
        <div
          onClick={() => setActiveTab('seetus')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.completedSeetus}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.completedSeetusCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Completed full 51 weeks</p>
        </div>

        {/* Upcoming Maturities */}
        <div
          onClick={() => setActiveTab('maturity')}
          className="col-span-2 sm:col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {t.upcomingMaturities}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition shadow-sm shadow-emerald-600/30">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              {stats.upcomingMaturitiesCount}
            </div>
            <span className="text-xs text-emerald-700 font-semibold">
              Eligible for ₹
              {(settings.weeklyAmount || 100) * (settings.totalWeeks || 51) +
                (settings.defaultExtraAmount || 300)}{' '}
              payout
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            Seetus in week 45-51 near full completion
          </p>
        </div>
      </div>

      {/* Weekly Collection Progress Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>51-Week Collection Cycle Progress</span>
            </h3>
            <p className="text-xs text-slate-500">
              Current highest recording is at Week {stats.currentSchemeWeek} of 51 weeks.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              {weeklySchemeRate}% Completed
            </span>
          </div>
        </div>

        {/* Progress Bar with milestone ticks */}
        <div className="relative pt-2 pb-4">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${weeklySchemeRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2 px-1">
            <span>Week 1 (Start)</span>
            <span>Week 13 (Q1)</span>
            <span>Week 26 (Mid)</span>
            <span>Week 39 (Q3)</span>
            <span className="text-emerald-700 font-bold">Week 51 (Maturity ₹5,400)</span>
          </div>
        </div>

        {/* Summary grid within progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Current Cycle Week</span>
            <span className="font-bold text-slate-800 text-sm">
              Week {stats.currentSchemeWeek} / 51
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Expected Per Seetu</span>
            <span className="font-bold text-slate-800 text-sm">₹5,100 (₹100 × 51)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Extra Bonus / Interest</span>
            <span className="font-bold text-emerald-700 text-sm">
              + ₹{settings.defaultExtraAmount || 300}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Maturity Payout</span>
            <span className="font-bold text-emerald-700 text-sm">
              ₹
              {(settings.weeklyAmount || 100) * (settings.totalWeeks || 51) +
                (settings.defaultExtraAmount || 300)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Urgent Pending & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Arrears Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t.pendingPayments} ({pendingMembers.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentPending.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              All members are up to date on their weekly payments!
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentPending.map((rec) => (
                <div
                  key={rec.member.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{rec.member.fullName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({rec.member.numberOfSeetus} Seetus • ₹{rec.expectedWeeklyAmount}/wk)
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                      {rec.pendingWeeksCount} weeks pending • Due: {formatINR(rec.totalPendingAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const msg = `வணக்கம் / Hello ${rec.member.fullName}, your weekly payment of ${formatINR(
                          rec.totalPendingAmount
                        )} (${rec.pendingWeeksCount} week(s) pending) is due for ${settings.cheettuName}. Please make payment. GPay/UPI: ${settings.upiId}`;
                        sendWhatsAppMessage(rec.member.mobileNumber, msg);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openPaymentModal({ memberId: rec.member.memberId })}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payment Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Payments</h3>
            </div>
            <button
              onClick={() => setActiveTab('paymentHistory')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No payments recorded yet. Click &ldquo;Record Payment&rdquo; to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                      W{p.weekNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{p.memberName}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.seetuId} • {p.paymentDate} • {p.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-700">
                      +{formatINR(p.amount)}
                    </span>
                    <button
                      onClick={() => openReceiptModal(p)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="View Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State as requested in Section 9 */}
      {members.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-base mb-1">
            No members added yet
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Start by adding members to Jothi Cheettu. Each member will have their own weekly seetus and login dashboard.
          </p>
          <button
            onClick={onOpenAddMember}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>
      )}
    </div>
  );
};

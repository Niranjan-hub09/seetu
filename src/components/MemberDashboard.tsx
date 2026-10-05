import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChithi } from '../context/ChithiContext';
import { formatINR } from '../utils/translations';
import {
  Layers,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  Receipt,
  QrCode,
  LogOut,
  Building2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Phone,
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { currentMemberProfile, logout } = useAuth();
  const { seetus, payments, maturities, settings, openReceiptModal } = useChithi();

  const [copiedUpi, setCopiedUpi] = useState(false);

  // This member's information
  const memberName = currentMemberProfile?.fullName || 'Member';
  const mobileNumber = currentMemberProfile?.mobileNumber || '';
  const mySeetus = seetus;
  const myPayments = payments;
  const myMaturities = maturities;

  const weeklyUnit = settings.weeklyAmount || 100;
  const seetuCount = mySeetus.length || currentMemberProfile?.numberOfSeetus || 0;
  const myWeeklyPayment = seetuCount * weeklyUnit;

  const totalPaid = mySeetus.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalRemaining = mySeetus.reduce((acc, s) => acc + (s.amountRemaining || 0), 0);

  // Max weeks completed among seetus
  const weeksCompleted =
    mySeetus.length > 0 ? Math.max(...mySeetus.map((s) => s.weeksPaid)) : 0;
  const totalWeeks = settings.totalWeeks || 51;
  const weeksRemaining = Math.max(0, totalWeeks - weeksCompleted);

  // Maturity calculations for this member
  const totalContribution = seetuCount * (weeklyUnit * totalWeeks);
  const extraInterestAmount = seetuCount * (settings.defaultExtraAmount || 300);
  const expectedMaturityAmount = totalContribution + extraInterestAmount;
  const maturityDate = mySeetus[0]?.maturityDate || 'Week 51 Completion';

  const upiId = settings.upiId || 'jothicheettu@okhdfcbank';
  const organizerPhone = settings.mobileNumber || '9840123456';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    settings.organizerName || 'Jothi Cheettu Organizer'
  )}&am=${myWeeklyPayment || 100}&cu=INR&tn=${encodeURIComponent(
    `Weekly Seetu payment for ${memberName}`
  )}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {settings.cheettuName}
              </h1>
              <p className="text-[11px] text-emerald-700 font-semibold">Member Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block">{memberName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{mobileNumber}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                Jothi Cheettu Savings Account
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {memberName}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Mobile: {mobileNumber} • Member ID:{' '}
                <span className="font-mono font-bold text-emerald-300">
                  {currentMemberProfile?.memberId || 'Active'}
                </span>
              </p>
            </div>

            <a
              href={upiDeepLink}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay Weekly {formatINR(myWeeklyPayment)}</span>
            </a>
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* My Seetus */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              My Seetus
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{seetuCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Active slots</p>
          </div>

          {/* Weekly Payment */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
              Weekly Payment
            </span>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatINR(myWeeklyPayment)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">₹{weeklyUnit}/wk per seetu</p>
          </div>

          {/* Total Paid */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
              Total Paid
            </span>
            <div className="text-2xl font-extrabold text-emerald-800">{formatINR(totalPaid)}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">{myPayments.length} installments</p>
          </div>

          {/* Amount Remaining */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
              Amount Remaining
            </span>
            <div className="text-2xl font-extrabold text-amber-700">
              {formatINR(totalRemaining)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">To complete 51 wks</p>
          </div>

          {/* Weeks Completed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Weeks Completed
            </span>
            <div className="text-2xl font-extrabold text-slate-900">
              {weeksCompleted} <span className="text-xs font-normal text-slate-400">/ 51</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {Math.round((weeksCompleted / 51) * 100)}% cycle done
            </p>
          </div>

          {/* Weeks Remaining */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Weeks Remaining
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{weeksRemaining}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Remaining weeks</p>
          </div>
        </div>

        {/* 51-Week Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-700">51-Week Savings Progress</span>
            <span className="text-emerald-700 font-bold">
              {weeksCompleted} of 51 Weeks Completed
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((weeksCompleted / 51) * 100))}%` }}
            />
          </div>
        </div>

        {/* My Pending Payments Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pending Payments</h3>
                <p className="text-xs text-slate-500">
                  Track pending balance and upcoming weekly installment dues.
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                totalRemaining > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {totalRemaining > 0 ? `${formatINR(totalRemaining)} Pending` : 'All Paid Up ✓'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-800 block">Total Pending Dues</span>
              <span className="text-lg font-bold text-amber-900">{formatINR(totalRemaining)}</span>
              <p className="text-[10px] text-amber-700 mt-0.5">Across {seetuCount} seetu slot(s)</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-600 block">Next Weekly Installment</span>
              <span className="text-lg font-bold text-slate-900">
                {weeksRemaining > 0 ? `Week ${weeksCompleted + 1}` : 'Scheme Completed'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {weeksRemaining > 0 ? `${formatINR(myWeeklyPayment)} due per week` : 'Eligible for maturity payout'}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-600 block">Unpaid Weeks Count</span>
              <span className="text-lg font-bold text-slate-900">{weeksRemaining} Weeks</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{weeksCompleted} of 51 weeks already paid</p>
            </div>
          </div>

          {/* Breakdown per seetu slot */}
          {mySeetus.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex justify-between">
                <span>Seetu Slot</span>
                <span>Weeks Paid / Total</span>
                <span>Paid</span>
                <span>Pending</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mySeetus.map((s) => (
                  <div key={s.id} className="px-3 py-2.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-800">{s.seetuId}</span>
                    <span className="font-medium text-slate-600">{s.weeksPaid} / 51 wks</span>
                    <span className="font-bold text-emerald-700">{formatINR(s.amountPaid)}</span>
                    <span className="font-bold text-amber-700">{formatINR(s.amountRemaining)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
            </div>
          )}
        </div>

        {/* My Maturity Details Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Maturity Details</h3>
              <p className="text-xs text-slate-500">
                Eligible settlement benefits upon completing all 51 weekly payments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">
                Total Contribution
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {formatINR(totalContribution)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {seetuCount} × ₹5,100
              </span>
            </div>

            <div>
              <span className="text-[11px] text-purple-700 block uppercase font-semibold">
                Interest / Extra Amount
              </span>
              <span className="text-base sm:text-lg font-bold text-purple-700">
                +{formatINR(extraInterestAmount)}
              </span>
              <span className="text-[10px] text-purple-600 block mt-0.5">
                {seetuCount} × ₹{settings.defaultExtraAmount || 300} bonus
              </span>
            </div>

            <div>
              <span className="text-[11px] text-emerald-800 block uppercase font-semibold">
                Expected Maturity Amount
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-800">
                {formatINR(expectedMaturityAmount)}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">Total payout</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">
                Maturity Date
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-800">
                {maturityDate}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">End of scheme</span>
            </div>
          </div>
        </div>

        {/* My Payment History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Payment History</h3>
              <p className="text-xs text-slate-500">
                Verified payment receipts recorded by organizer.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {myPayments.length} Payments
            </span>
          </div>

          {myPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No payments recorded yet. Contact organizer after making your weekly deposit.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Week</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Seetu ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                          W{p.weekNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.paymentDate}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{p.seetuId}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openReceiptModal(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Organizer Payment Info Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Need to pay this week?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Send your weekly payment of {formatINR(myWeeklyPayment)} directly to organizer via GPay / UPI.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono font-bold text-emerald-800">
              <span>UPI: {upiId}</span>
              <button
                onClick={handleCopyUPI}
                className="p-1 bg-white border border-slate-200 rounded text-slate-500 hover:text-emerald-700"
                title="Copy UPI"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
              <span className="text-slate-400 font-normal">| Organizer Ph: {organizerPhone}</span>
            </div>
          </div>

          <a
            href={upiDeepLink}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open UPI App</span>
          </a>
        </div>
      </main>
    </div>
  );
};

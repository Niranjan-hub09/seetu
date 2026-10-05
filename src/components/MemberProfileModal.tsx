import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { formatINR } from '../utils/translations';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Gift,
  CreditCard,
  MessageCircle,
  Receipt,
  FileText,
  Clock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const MemberProfileModal: React.FC = () => {
  const {
    members,
    seetus,
    payments,
    settings,
    selectedMemberIdForProfile,
    setSelectedMemberIdForProfile,
    openPaymentModal,
    openReceiptModal,
    sendWhatsAppMessage,
  } = useChithi();

  const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'history'>('overview');
  const [resetStatus, setResetStatus] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  if (!selectedMemberIdForProfile) return null;

  const member = members.find((m) => m.memberId === selectedMemberIdForProfile);
  if (!member) return null;

  const handleSendResetEmail = async () => {
    if (!member.email) {
      setResetStatus('Error: Member email is required.');
      return;
    }
    setIsResetting(true);
    setResetStatus('');
    try {
      await sendPasswordResetEmail(auth, member.email.trim());
      setResetStatus(`Password reset link sent to ${member.email}`);
    } catch (err: unknown) {
      setResetStatus(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  const memberSeetus = seetus.filter((s) => s.memberId === member.memberId);
  const memberPayments = payments.filter((p) => p.memberId === member.memberId);

  const totalPaid = memberSeetus.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalRemaining = memberSeetus.reduce((acc, s) => acc + (s.amountRemaining || 0), 0);
  const activeCount = memberSeetus.filter(
    (s) => s.status !== 'Completed' && s.status !== 'Matured'
  ).length;
  const completedCount = memberSeetus.filter(
    (s) => s.status === 'Completed' || s.status === 'Matured'
  ).length;

  const weeklyUnit = settings.weeklyAmount || 100;
  const weeklyDue = member.numberOfSeetus * weeklyUnit;
  const totalWeeks = settings.totalWeeks || 51;
  const defaultExtra = settings.defaultExtraAmount || 300;

  // Expected maturity date from first seetu
  const expectedMaturityDate = memberSeetus[0]?.maturityDate || 'End of 51 weeks';
  const totalMaturityExpected = memberSeetus.reduce(
    (acc, s) => acc + (s.totalExpectedAmount + (s.extraInterestAmount || defaultExtra)),
    0
  );
  const totalBonus = memberSeetus.reduce(
    (acc, s) => acc + (s.extraInterestAmount || defaultExtra),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-6 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setSelectedMemberIdForProfile(null)}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Member Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {member.memberId}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{member.fullName}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {member.mobileNumber}
              </span>
              {member.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {member.address}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined: {member.joiningDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const msg = `வணக்கம் / Hello ${member.fullName}, your weekly payment of ${formatINR(
                  weeklyDue
                )} is due for ${settings.cheettuName}. GPay/UPI: ${settings.upiId}`;
                sendWhatsAppMessage(member.mobileNumber, msg);
              }}
              className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => {
                setSelectedMemberIdForProfile(null);
                openPaymentModal({ memberId: member.memberId });
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 pt-4 pb-2 border-b border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Seetus
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'grid'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            51-Week Matrix
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'history'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Payment Receipts ({memberPayments.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Weekly Due
                  </span>
                  <span className="text-base font-extrabold text-slate-800">
                    {formatINR(weeklyDue)}/wk
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {member.numberOfSeetus} × ₹{weeklyUnit}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Total Paid
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {formatINR(totalPaid)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block">Recorded in system</span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    Balance Remaining
                  </span>
                  <span className="text-base font-extrabold text-amber-700">
                    {formatINR(totalRemaining)}
                  </span>
                  <span className="text-[10px] text-amber-600 block">Remaining to complete</span>
                </div>

                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">
                    Maturity Payout
                  </span>
                  <span className="text-base font-extrabold text-purple-700">
                    {formatINR(totalMaturityExpected)}
                  </span>
                  <span className="text-[10px] text-purple-600 block">
                    Incl. {formatINR(totalBonus)} extra
                  </span>
                </div>
              </div>

              {/* Member Login & Security Account Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Member Login & Account Security</h4>
                      <p className="text-[11px] text-slate-500">
                        Email: <span className="font-semibold text-slate-800">{member.email || 'Not provided'}</span>
                        {member.uid && (
                          <span className="ml-2 font-mono text-[10px] text-slate-400">
                            UID: {member.uid.slice(0, 10)}...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={handleSendResetEmail}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'Sending...' : 'Reset Password'}</span>
                  </button>
                </div>

                {resetStatus && (
                  <div
                    className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      resetStatus.startsWith('Error')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {resetStatus.startsWith('Error') ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    <span>{resetStatus}</span>
                  </div>
                )}
              </div>

              {/* Seetus List for this Member */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Assigned Seetus ({memberSeetus.length})
                </h4>
                <div className="space-y-2">
                  {memberSeetus.map((seetu) => {
                    const percent = Math.min(
                      100,
                      Math.round((seetu.weeksPaid / seetu.totalWeeks) * 100)
                    );
                    return (
                      <div
                        key={seetu.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {seetu.seetuId}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              ₹{seetu.weeklyAmount}/wk • 51 Weeks
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              seetu.status === 'Completed' || seetu.status === 'Matured'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {seetu.status}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                          <div>
                            <span className="text-slate-400">Weeks: </span>
                            <span className="font-bold text-slate-800">
                              {seetu.weeksPaid} / {seetu.totalWeeks}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Paid: </span>
                            <span className="font-bold text-emerald-700">
                              {formatINR(seetu.amountPaid)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Remaining: </span>
                            <span className="font-bold text-amber-700">
                              {formatINR(seetu.amountRemaining)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Maturity Date: </span>
                            <span className="font-semibold">{seetu.maturityDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {member.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                  <span className="font-bold">Organizer Notes: </span>
                  <span>{member.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* 51-Week Matrix View */}
          {activeTab === 'grid' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Visual matrix of all 51 weeks. Green blocks represent verified recorded payments.
              </p>

              {memberSeetus.map((seetu) => {
                const paidWeeksSet = new Set(
                  memberPayments
                    .filter((p) => p.seetuId === seetu.seetuId)
                    .map((p) => p.weekNumber)
                );

                return (
                  <div key={seetu.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xs text-slate-800">
                        {seetu.seetuId} (Weeks Paid: {seetu.weeksPaid} / 51)
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {formatINR(seetu.amountPaid)} / {formatINR(seetu.totalExpectedAmount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                      {Array.from({ length: 51 }, (_, i) => i + 1).map((weekNum) => {
                        const isPaid = paidWeeksSet.has(weekNum) || weekNum <= seetu.weeksPaid;
                        return (
                          <div
                            key={weekNum}
                            className={`p-1 text-center rounded-lg text-[10px] font-mono font-bold transition ${
                              isPaid
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                            title={`Week ${weekNum}: ${isPaid ? 'Paid ₹' + seetu.weeklyAmount : 'Pending'}`}
                          >
                            W{weekNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment Receipts History */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {memberPayments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No payment records found for this member.
                </div>
              ) : (
                <div className="space-y-2">
                  {memberPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono">
                          W{p.weekNumber}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {formatINR(p.amount)} • {p.paymentMethod}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.paymentDate} • Seetu: {p.seetuId} • {p.receiptNo}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openReceiptModal(p)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useChithi } from '../context/ChithiContext';
import { Payment } from '../types';
import { formatINR } from '../utils/translations';
import {
  X,
  CreditCard,
  User,
  Layers,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Receipt,
} from 'lucide-react';

export const WeeklyPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    paymentModalPrefill,
    members,
    seetus,
    payments,
    settings,
    recordWeeklyPayment,
    openReceiptModal,
  } = useChithi();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedSeetuId, setSelectedSeetuId] = useState('');
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(settings.weeklyAmount || 100);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Cash');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync prefill or defaults when opened
  useEffect(() => {
    if (!isPaymentModalOpen) return;

    setErrorMsg('');
    const targetMemberId =
      paymentModalPrefill?.memberId || (members.length > 0 ? members[0].memberId : '');
    setSelectedMemberId(targetMemberId);

    const memberSeetus = seetus.filter((s) => s.memberId === targetMemberId);
    const targetSeetu =
      memberSeetus.find((s) => s.seetuId === paymentModalPrefill?.seetuId) || memberSeetus[0];

    if (targetSeetu) {
      setSelectedSeetuId(targetSeetu.seetuId);
      const nextWeek =
        paymentModalPrefill?.weekNumber ||
        Math.min(targetSeetu.totalWeeks, targetSeetu.weeksPaid + 1);
      setWeekNumber(nextWeek);
      setAmount(targetSeetu.weeklyAmount || settings.weeklyAmount || 100);
    } else {
      setSelectedSeetuId('');
      setWeekNumber(paymentModalPrefill?.weekNumber || 1);
      setAmount(settings.weeklyAmount || 100);
    }

    setPaymentDate(new Date().toISOString().split('T')[0]);
  }, [isPaymentModalOpen, paymentModalPrefill, members, seetus, settings.weeklyAmount]);

  // When member changes, update available seetus
  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId);
    const memberSeetus = seetus.filter((s) => s.memberId === mId);
    if (memberSeetus.length > 0) {
      const active =
        memberSeetus.find((s) => s.status !== 'Completed' && s.status !== 'Matured') ||
        memberSeetus[0];
      setSelectedSeetuId(active.seetuId);
      setWeekNumber(Math.min(active.totalWeeks, active.weeksPaid + 1));
      setAmount(active.weeklyAmount || 100);
    } else {
      setSelectedSeetuId('');
    }
  };

  // When seetu changes, update next unpaid week
  const handleSeetuChange = (sId: string) => {
    setSelectedSeetuId(sId);
    const s = seetus.find((x) => x.seetuId === sId);
    if (s) {
      setWeekNumber(Math.min(s.totalWeeks, s.weeksPaid + 1));
      setAmount(s.weeklyAmount || 100);
    }
  };

  if (!isPaymentModalOpen) return null;

  const currentMember = members.find((m) => m.memberId === selectedMemberId);
  const memberSeetus = seetus.filter((s) => s.memberId === selectedMemberId);
  const currentSeetu = seetus.find((s) => s.seetuId === selectedSeetuId);

  // Check if week was already paid
  const isAlreadyPaid = payments.some(
    (p) => p.seetuId === selectedSeetuId && p.weekNumber === Number(weekNumber)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMemberId || !selectedSeetuId) {
      setErrorMsg('Please select a valid member and seetu slot.');
      return;
    }

    if (isAlreadyPaid) {
      setErrorMsg(
        `Payment for ${selectedSeetuId} Week ${weekNumber} is already recorded in history. Duplicate payments are prevented.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await recordWeeklyPayment({
        memberId: selectedMemberId,
        memberName: currentMember?.fullName || 'Member',
        seetuId: selectedSeetuId,
        weekNumber: Number(weekNumber),
        paymentDate,
        amount: Number(amount),
        paymentMethod,
        notes: notes.trim(),
      });

      closePaymentModal();
      if (saved) {
        openReceiptModal(saved);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8">
        <button
          onClick={closePaymentModal}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Weekly Payment</h3>
            <p className="text-xs text-slate-500">
              Quick 1-click recording with immediate balance update and instant receipt.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Member (உறுப்பினர்) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                value={selectedMemberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-medium"
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.memberId}>
                    {m.fullName} ({m.memberId}) • {m.numberOfSeetus} Seetus • {m.mobileNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seetu Selection & Week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seetu Slot (சீட்டு எண்) *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={selectedSeetuId}
                  onChange={(e) => handleSeetuChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-mono font-semibold"
                  required
                >
                  {memberSeetus.map((s) => (
                    <option key={s.id} value={s.seetuId}>
                      {s.seetuId} (Paid {s.weeksPaid}/{s.totalWeeks} Wks)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Week Number (வாரம்) *
              </label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-bold"
              >
                {Array.from({ length: 51 }, (_, i) => i + 1).map((w) => {
                  const alreadyPaid = payments.some(
                    (p) => p.seetuId === selectedSeetuId && p.weekNumber === w
                  );
                  return (
                    <option key={w} value={w} disabled={alreadyPaid}>
                      Week {w} {alreadyPaid ? '✓ (Already Paid)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (தொகை) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="100"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-bold text-emerald-800"
                  required
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date (தேதி) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method (செலுத்தும் முறை)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'GPay / UPI', 'Bank Transfer'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at weekly meet"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-xs"
            />
          </div>

          {/* Summary Preview Box */}
          {currentSeetu && (
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Current Progress for {currentSeetu.seetuId}:</span>
                <span className="font-bold text-slate-800">
                  {currentSeetu.weeksPaid} / 51 Weeks Paid ({formatINR(currentSeetu.amountPaid)})
                </span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>After this payment:</span>
                <span>
                  {Math.min(51, currentSeetu.weeksPaid + 1)} / 51 Weeks Paid (
                  {formatINR(currentSeetu.amountPaid + Number(amount))})
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closePaymentModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAlreadyPaid}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Payment & Issue Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

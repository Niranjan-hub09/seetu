import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { Maturity } from '../types';
import { translations, formatINR } from '../utils/translations';
import confetti from 'canvas-confetti';
import {
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  FileCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const MaturityPage: React.FC = () => {
  const {
    maturities,
    seetus,
    settings,
    language,
    settleMaturity,
    sendWhatsAppMessage,
  } = useChithi();
  const t = translations[language];

  const [settlingMaturity, setSettlingMaturity] = useState<Maturity | null>(null);
  const [settleNotes, setSettleNotes] = useState('Paid to member via Cash / Bank Transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Near maturity seetus (Weeks 45 to 50)
  const nearMaturitySeetus = seetus.filter(
    (s) => s.weeksPaid >= 45 && s.weeksPaid < (settings.totalWeeks || 51)
  );

  const eligibleMaturities = maturities.filter((m) => m.status === 'Eligible');
  const settledMaturities = maturities.filter((m) => m.status === 'Settled');

  const totalMaturityDisbursed = settledMaturities.reduce(
    (acc, m) => acc + (m.maturityAmount || 0),
    0
  );
  const totalMaturityPending = eligibleMaturities.reduce(
    (acc, m) => acc + (m.maturityAmount || 0),
    0
  );

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingMaturity) return;

    setIsSubmitting(true);
    try {
      await settleMaturity(settlingMaturity.id, settlingMaturity.seetuId, settleNotes);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSettlingMaturity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMaturityWhatsApp = (m: Maturity) => {
    const msg =
      language === 'ta'
        ? `வாழ்த்துக்கள் ${m.memberName} அவர்களே! \nஉங்கள் ${settings.cheettuName} 51 வார சீட்டு (${m.seetuId}) வெற்றிகரமாக முடிவடைந்து முதிர்வடைந்தது! \nமொத்த சேமிப்பு: ${formatINR(m.totalContribution)} \nகூடுதல் போனஸ்/வட்டி: ${formatINR(m.extraInterestAmount)} \nமொத்த முதிர்வுத் தொகை: ${formatINR(m.maturityAmount)}. \nபட்டுவாடா விபரங்களை அறிய அமைப்பாளரை தொடர்பு கொள்ளவும்.`
        : `Congratulations ${m.memberName}! \nYour 51-week seetu (${m.seetuId}) under ${settings.cheettuName} has successfully completed & matured! \nTotal Contribution: ${formatINR(m.totalContribution)} \nBonus / Extra Interest: ${formatINR(m.extraInterestAmount)} \nTotal Maturity Payout: ${formatINR(m.maturityAmount)}. \nPlease contact organizer for settlement.`;

    sendWhatsAppMessage(m.memberMobile, msg);
  };

  const weeklyUnit = settings.weeklyAmount || 100;
  const totalWeeks = settings.totalWeeks || 51;
  const standardContribution = weeklyUnit * totalWeeks;
  const standardBonus = settings.defaultExtraAmount || 300;
  const standardMaturity = standardContribution + standardBonus;

  return (
    <div className="space-y-6">
      {/* Top Banner with Scheme Maturity Equation */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
              <Gift className="w-3.5 h-3.5 text-purple-300" />
              <span>Diwali & Annual Scheme Maturity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.maturityDiwali}
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Upon completing 51 weekly contributions, members receive their total contribution plus an extra organizer bonus amount.
            </p>
          </div>

          {/* Configurable Formula Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs sm:text-sm">
            <span className="text-[11px] text-purple-200 font-semibold uppercase tracking-wider block mb-1">
              Active Scheme Terms (Configurable)
            </span>
            <div className="flex items-center gap-2 text-white font-mono text-base font-bold">
              <span>{formatINR(standardContribution)}</span>
              <span className="text-emerald-400">+ {formatINR(standardBonus)}</span>
              <span>=</span>
              <span className="text-emerald-300 text-lg">{formatINR(standardMaturity)}</span>
            </div>
            <p className="text-[11px] text-purple-200 mt-1">
              ₹{weeklyUnit} × 51 weeks + ₹{standardBonus} extra bonus = {formatINR(standardMaturity)} per seetu
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Eligible for Settlement
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {formatINR(totalMaturityPending)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {eligibleMaturities.length} completed seetus waiting payout
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Settled & Disbursed
          </span>
          <div className="text-2xl font-extrabold text-purple-700">
            {formatINR(totalMaturityDisbursed)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {settledMaturities.length} seetus marked as settled
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Near Maturity (Weeks 45-50)
          </span>
          <div className="text-2xl font-extrabold text-indigo-700">
            {nearMaturitySeetus.length} Seetus
          </div>
          <p className="text-xs text-slate-500 mt-1">Approaching 51st week finish</p>
        </div>
      </div>

      {/* Eligible Maturities Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Completed 51-Week Seetus (Ready for Settlement)
              </h3>
              <p className="text-xs text-slate-500">
                Members who have paid all 51 installments and are entitled to payout.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
            {eligibleMaturities.length} Eligible
          </span>
        </div>

        {eligibleMaturities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No completed seetus waiting for settlement currently.
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleMaturities.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {m.seetuId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{m.memberName}</h4>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {m.memberMobile}
                    </span>
                    <span>Contribution: {formatINR(m.totalContribution)}</span>
                    <span className="text-emerald-700 font-semibold">
                      Extra Bonus: +{formatINR(m.extraInterestAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-200/50">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Maturity Payout
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800">
                      {formatINR(m.maturityAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendMaturityWhatsApp(m)}
                      className="p-2.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-xl text-xs font-bold transition cursor-pointer"
                      title="Send Congratulatory WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSettlingMaturity(m)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Settle Payout</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settled History */}
      {settledMaturities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Settled Payouts History ({settledMaturities.length})</span>
          </h3>

          <div className="space-y-2">
            {settledMaturities.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{m.memberName}</span>
                    <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {m.seetuId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Settled on: {m.settledDate || 'Recorded'} • {m.settledNotes}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatINR(m.maturityAmount)}</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Settled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {settlingMaturity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Settle Maturity: {settlingMaturity.memberName}
                </h3>
                <p className="text-xs text-slate-500">Seetu ID: {settlingMaturity.seetuId}</p>
              </div>
            </div>

            <form onSubmit={handleSettle} className="space-y-4 text-xs">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>51 Weeks Total Contribution:</span>
                  <span className="font-semibold">{formatINR(settlingMaturity.totalContribution)}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Extra Interest / Bonus:</span>
                  <span className="font-semibold">+{formatINR(settlingMaturity.extraInterestAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-950 font-extrabold text-sm pt-2 border-t border-emerald-200">
                  <span>Total Settlement Amount:</span>
                  <span>{formatINR(settlingMaturity.maturityAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Settlement Notes / Transaction Reference
                </label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="e.g. Paid in full via cash / bank transfer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingMaturity(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payout & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

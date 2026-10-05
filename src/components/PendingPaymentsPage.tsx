import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { translations, formatINR } from '../utils/translations';
import {
  AlertTriangle,
  Search,
  MessageCircle,
  CreditCard,
  Phone,
  Layers,
  CheckCircle2,
  Calendar,
  Send,
  Filter,
} from 'lucide-react';

export const PendingPaymentsPage: React.FC = () => {
  const { pendingMembers, language, sendWhatsAppMessage, openPaymentModal, settings } =
    useChithi();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeeks, setFilterWeeks] = useState<'All' | '1' | '2' | '4'>('All');

  const filtered = pendingMembers.filter((item) => {
    const matchSearch =
      item.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.member.mobileNumber.includes(searchTerm) ||
      item.member.memberId.toLowerCase().includes(searchTerm.toLowerCase());

    let matchWeeks = true;
    if (filterWeeks === '1') matchWeeks = item.pendingWeeksCount >= 1;
    if (filterWeeks === '2') matchWeeks = item.pendingWeeksCount >= 2;
    if (filterWeeks === '4') matchWeeks = item.pendingWeeksCount >= 4;

    return matchSearch && matchWeeks;
  });

  const totalArrears = filtered.reduce((acc, i) => acc + i.totalPendingAmount, 0);

  const handleSendReminder = (item: (typeof pendingMembers)[0]) => {
    const amountStr = formatINR(item.totalPendingAmount);
    const weeklyStr = formatINR(item.expectedWeeklyAmount);
    const msg =
      language === 'ta'
        ? `வணக்கம் ${item.member.fullName} அவர்களே, \nஉங்கள் ${settings.cheettuName} வாராந்திர சீட்டு நிலுவைத் தொகை ${amountStr} (${item.pendingWeeksCount} வாரங்கள், வாரம் ${weeklyStr}) உள்ளது. \nதயவுசெய்து தொகையை செலுத்தவும்.\nGPay/UPI ID: ${settings.upiId} \nநன்றி!`
        : `Hello ${item.member.fullName}, \nYour weekly payment of ${amountStr} (${item.pendingWeeksCount} week(s) pending, weekly commit ${weeklyStr}) is due for ${settings.cheettuName}. \nPlease make the payment at your earliest convenience.\nGPay/UPI ID: ${settings.upiId}\nThank you!`;

    sendWhatsAppMessage(item.member.mobileNumber, msg);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-amber-700">{t.pendingPayments}</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {pendingMembers.length} Members with Arrears
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of unpaid weekly collections with 1-click WhatsApp reminders.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Arrears Amount</span>
          <span className="text-lg sm:text-xl font-extrabold text-amber-700">
            {formatINR(totalArrears)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pending members by name, mobile, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { label: 'All Pending', val: 'All' },
              { label: '1+ Weeks', val: '1' },
              { label: '2+ Weeks', val: '2' },
              { label: '4+ Weeks (Critical)', val: '4' },
            ] as const
          ).map((item) => (
            <button
              key={item.val}
              onClick={() => setFilterWeeks(item.val)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterWeeks === item.val
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-700">No Pending Payments Found!</p>
          <p className="text-xs text-slate-400 mt-1">
            All member payments for the active cycle weeks are completely up to date.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Seetu Count</th>
                  <th className="py-3 px-4">Weekly Expected</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Pending Amount</th>
                  <th className="py-3 px-4">Pending Weeks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.member.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{item.member.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.member.memberId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.member.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-xs font-bold">
                        {item.member.numberOfSeetus} Seetu{item.member.numberOfSeetus > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatINR(item.expectedWeeklyAmount)} / wk
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatINR(item.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-amber-700 text-sm">
                        {formatINR(item.totalPendingAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.pendingWeeksCount >= 3
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.pendingWeeksCount} week{item.pendingWeeksCount > 1 ? 's' : ''} pending
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendReminder(item)}
                          className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Send Pre-filled WhatsApp Reminder"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => openPaymentModal({ memberId: item.member.memberId })}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

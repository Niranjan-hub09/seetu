import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { Seetu, SeetuStatus } from '../types';
import { translations, formatINR } from '../utils/translations';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Gift,
  CreditCard,
  User,
  Filter,
} from 'lucide-react';

export const SeetuPage: React.FC = () => {
  const { seetus, language, openPaymentModal, setSelectedMemberIdForProfile, settings } =
    useChithi();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SeetuStatus>('All');

  const filtered = seetus.filter((s) => {
    const matchSearch =
      s.seetuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.memberMobile.includes(searchTerm);

    const matchStatus = statusFilter === 'All' ? true : s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = seetus.filter((s) => s.status === 'Active').length;
  const completedCount = seetus.filter(
    (s) => s.status === 'Completed' || s.status === 'Matured'
  ).length;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.seetuDetails}</span>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              {seetus.length} Slots
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            51-Week individual savings units (₹{settings.weeklyAmount || 100}/week • Total Expected: ₹5,100).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-100">
            {activeCount} Active
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-800 font-bold rounded-xl border border-purple-100">
            {completedCount} Completed
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
            placeholder="Search by Seetu ID (e.g. S001), Member name, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Active', 'Completed', 'Matured', 'Pending'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No Seetu records found</p>
          <p className="text-xs text-slate-400 mt-1">Adjust search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Seetu ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Weekly Amt</th>
                  <th className="py-3 px-4">Weeks Paid / Total</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Maturity Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const percent = Math.min(100, Math.round((s.weeksPaid / s.totalWeeks) * 100));
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {s.seetuId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedMemberIdForProfile(s.memberId)}
                          className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                        >
                          {s.memberName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.memberId} • {s.memberMobile}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        ₹{s.weeklyAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-mono">
                            {s.weeksPaid} / {s.totalWeeks}
                          </span>
                          <span className="text-[10px] text-slate-400">({percent}%)</span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              percent === 100 ? 'bg-purple-600' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatINR(s.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-700">
                        {formatINR(s.amountRemaining)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{s.maturityDate}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            s.status === 'Completed' || s.status === 'Matured'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              openPaymentModal({
                                memberId: s.memberId,
                                seetuId: s.seetuId,
                                weekNumber: Math.min(s.totalWeeks, s.weeksPaid + 1),
                              })
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay W{Math.min(s.totalWeeks, s.weeksPaid + 1)}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

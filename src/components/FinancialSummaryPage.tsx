import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { translations, formatINR } from '../utils/translations';
import { exportFinancialSummaryToCSV } from '../utils/exportUtils';
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  IndianRupee,
  Layers,
  TrendingUp,
  AlertTriangle,
  Gift,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export const FinancialSummaryPage: React.FC = () => {
  const { payments, seetus, members, settings, language } = useChithi();
  const t = translations[language];

  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter payments by date range
  const filteredPayments = payments.filter((p) => {
    if (dateFilter === 'all') return true;
    const pDate = new Date(p.paymentDate);
    const now = new Date();

    if (dateFilter === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return pDate >= sevenDaysAgo && pDate <= now;
    }
    if (dateFilter === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return pDate >= thirtyDaysAgo && pDate <= now;
    }
    if (dateFilter === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return pDate >= yearStart && pDate <= now;
    }
    if (dateFilter === 'custom') {
      if (!customStart && !customEnd) return true;
      if (customStart && pDate < new Date(customStart)) return false;
      if (customEnd && pDate > new Date(customEnd)) return false;
      return true;
    }
    return true;
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPending = seetus.reduce((acc, s) => acc + (s.amountRemaining || 0), 0);

  const activeSeetus = seetus.filter(
    (s) => s.status !== 'Completed' && s.status !== 'Matured'
  ).length;
  const completedSeetus = seetus.filter(
    (s) => s.status === 'Completed' || s.status === 'Matured'
  ).length;

  const defaultExtra = settings.defaultExtraAmount || 300;
  const totalExtraBonus = seetus.length * defaultExtra;
  const totalMaturityLiability = seetus.reduce(
    (acc, s) => acc + (s.totalExpectedAmount + (s.extraInterestAmount || defaultExtra)),
    0
  );

  // Group payments by week number for visual chart
  const weekGroupMap: { [week: number]: number } = {};
  filteredPayments.forEach((p) => {
    weekGroupMap[p.weekNumber] = (weekGroupMap[p.weekNumber] || 0) + (p.amount || 0);
  });

  const maxWeeklyCollected = Math.max(...Object.values(weekGroupMap), 500);

  const handleExportSummary = () => {
    exportFinancialSummaryToCSV({
      totalCollected,
      totalPending,
      totalMembers: members.length,
      totalSeetus: seetus.length,
      completedSeetus,
      activeSeetus,
      totalMaturityLiability,
      totalExtraBonus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.financialSummary}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit summary of collections, outstanding balances, and maturity liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSummary}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.exportCSV}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Period Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'week', label: 'This Week (7 Days)' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                dateFilter === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* 6 Key Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Money Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Total Money Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {formatINR(totalCollected)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {filteredPayments.length} transactions in selected period
          </p>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Total Pending Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {formatINR(totalPending)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Remaining to be collected from members</p>
        </div>

        {/* Total Amount Due for Maturity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Total Maturity Liability
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">
            {formatINR(totalMaturityLiability)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total payout committed across all {seetus.length} seetus
          </p>
        </div>

        {/* Total Interest / Extra Bonus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Total Extra / Interest Bonus
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">
            {formatINR(totalExtraBonus)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {seetus.length} Seetus × ₹{defaultExtra} scheme incentive
          </p>
        </div>

        {/* Total Completed Seetus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Seetus
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{completedSeetus}</div>
          <p className="text-[11px] text-slate-500 mt-1">Reached full 51 weeks</p>
        </div>

        {/* Total Active Seetus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Seetus
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeSeetus}</div>
          <p className="text-[11px] text-slate-500 mt-1">Currently contributing weekly</p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Weekly Collection Volume</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Collection totals grouped by week number in the scheme.
          </p>

          {Object.keys(weekGroupMap).length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No collection data in this period.
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(weekGroupMap)
                .sort(([a], [b]) => Number(a) - Number(b))
                .slice(0, 10)
                .map(([wk, amt]) => {
                  const barWidth = Math.round((amt / maxWeeklyCollected) * 100);
                  return (
                    <div key={wk} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">Week {wk}</span>
                        <span className="text-emerald-700">{formatINR(amt)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max(8, barWidth)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Collection Breakdown Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Capital Breakdown vs Pending Balance</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Comparison between total funds collected and balance yet to be received.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-800">Collected Capital</span>
                  <span>{formatINR(totalCollected)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{
                      width: `${Math.round(
                        (totalCollected / Math.max(1, totalCollected + totalPending)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-800">Remaining Pending</span>
                  <span>{formatINR(totalPending)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${Math.round(
                        (totalPending / Math.max(1, totalCollected + totalPending)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Overall Collection Rate:</span>
            <span className="font-bold text-slate-900 text-sm">
              {Math.round(
                (totalCollected / Math.max(1, totalCollected + totalPending)) * 100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

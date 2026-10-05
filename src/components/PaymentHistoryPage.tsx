import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { Payment } from '../types';
import { translations, formatINR } from '../utils/translations';
import { exportPaymentsToCSV } from '../utils/exportUtils';
import {
  History,
  Search,
  Receipt,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const { payments, members, seetus, language, openReceiptModal, removePayment } = useChithi();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState('All');
  const [seetuFilter, setSeetuFilter] = useState('All');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seetuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMember = memberFilter === 'All' ? true : p.memberId === memberFilter;
    const matchSeetu = seetuFilter === 'All' ? true : p.seetuId === seetuFilter;

    return matchSearch && matchMember && matchSeetu;
  });

  const totalFilteredAmount = filtered.reduce((acc, p) => acc + (p.amount || 0), 0);

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    await removePayment(paymentToDelete);
    setPaymentToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.paymentHistory}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {payments.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete weekly transaction ledger with receipts and correction audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPaymentsToCSV(filtered)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.exportCSV}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member, seetu, receipt #..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            >
              <option value="All">All Members ({members.length})</option>
              {members.map((m) => (
                <option key={m.id} value={m.memberId}>
                  {m.fullName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={seetuFilter}
              onChange={(e) => setSeetuFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition font-mono"
            >
              <option value="All">All Seetus ({seetus.length})</option>
              {seetus.map((s) => (
                <option key={s.id} value={s.seetuId}>
                  {s.seetuId} ({s.memberName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filtered.length} entries</span>
          <span className="font-bold text-emerald-700">
            Total Filtered Amount: {formatINR(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No payment records found</p>
          <p className="text-xs text-slate-400 mt-1">Adjust filters or record a new weekly payment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Week</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Seetu ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Receipt</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                        W{p.weekNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.memberName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{p.seetuId}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openReceiptModal(p)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="font-mono">{p.receiptNo}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPaymentToDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete / Correct Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Correction Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete / Rollback Payment?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              This will remove Week {paymentToDelete.weekNumber} payment ({formatINR(paymentToDelete.amount)}) for {paymentToDelete.memberName} ({paymentToDelete.seetuId}), and automatically restore the Seetu remaining balance.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
              >
                Yes, Delete & Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

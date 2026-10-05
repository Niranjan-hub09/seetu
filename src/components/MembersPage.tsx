import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { Member } from '../types';
import { translations, formatINR } from '../utils/translations';
import { exportMembersToCSV } from '../utils/exportUtils';
import { auth } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  CreditCard,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  Users,
  Eye,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface MembersPageProps {
  onOpenAddMember: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ onOpenAddMember }) => {
  const {
    members,
    seetus,
    settings,
    language,
    setSelectedMemberIdForProfile,
    openPaymentModal,
    removeMember,
    editMember,
  } = useChithi();

  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [resettingMember, setResettingMember] = useState<Member | null>(null);
  const [resetStatus, setResetStatus] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  // Filter members
  const filtered = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mobileNumber.includes(searchTerm) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const weeklyUnit = settings.weeklyAmount || 100;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    await editMember(editingMember.id, {
      fullName: editingMember.fullName,
      mobileNumber: editingMember.mobileNumber,
      email: editingMember.email,
      address: editingMember.address,
      status: editingMember.status,
      notes: editingMember.notes,
    });
    setEditingMember(null);
  };

  const handleResetPassword = async () => {
    if (!resettingMember?.email) {
      setResetStatus('Error: Member email is required to send password reset link.');
      return;
    }
    setIsResetting(true);
    setResetStatus('');
    try {
      await sendPasswordResetEmail(auth, resettingMember.email.trim());
      setResetStatus(
        `Success! Password reset link sent to ${resettingMember.email}. Member can click the link to choose a new password.`
      );
    } catch (err: unknown) {
      setResetStatus(
        err instanceof Error ? err.message : 'Failed to send password reset email.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;
    await removeMember(deletingMember.id, deletingMember.memberId);
    setDeletingMember(null);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Members Management</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {members.length} Members
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin oversight: member accounts, weekly seetu slots, total collections, and member access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {members.length > 0 && (
            <button
              onClick={() => exportMembersToCSV(members, settings.weeklyAmount || 100)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Download Members list as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      {members.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by member name, mobile, email, or Member ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
          />
        </div>
      )}

      {/* Empty State as requested in Section 9 */}
      {members.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No members added yet</h3>
          <p className="text-xs text-slate-500 mb-5">
            Get started by adding your first scheme member. They will receive dedicated login credentials.
          </p>
          <button
            onClick={onOpenAddMember}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Member</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No members match your search</p>
          <p className="text-xs text-slate-400 mt-1">Try another name or mobile search.</p>
        </div>
      ) : (
        /* Members Table: Name, Mobile, Email, Number of Seetus, Total Paid, Pending Amount, Status, Actions */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Seetus</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Pending Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => {
                  const memberSeetus = seetus.filter((s) => s.memberId === member.memberId);
                  const totalPaid = memberSeetus.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
                  const totalRemaining = memberSeetus.reduce(
                    (acc, s) => acc + (s.amountRemaining || 0),
                    0
                  );

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{member.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {member.memberId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {member.mobileNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{member.email || '—'}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-xs">
                          {member.numberOfSeetus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatINR(totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">
                        {formatINR(totalRemaining)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            member.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {member.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedMemberIdForProfile(member.memberId)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="View member details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPaymentModal({ memberId: member.memberId })}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Record weekly payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setResettingMember(member);
                              setResetStatus('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                            title="Reset member password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingMember(member)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Edit member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete member"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Edit Member: {editingMember.fullName} ({editingMember.memberId})
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingMember.fullName}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editingMember.mobileNumber}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, mobileNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingMember.status || 'Active'}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={editingMember.address}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editingMember.notes || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Member {deletingMember.fullName}?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              This will remove member {deletingMember.memberId}, all their assigned seetus, and all payment records associated with them.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {resettingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reset Password for {resettingMember.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registered email: <span className="font-semibold text-slate-700">{resettingMember.email || 'None'}</span>
            </p>

            {resetStatus && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 text-left flex items-start gap-2 ${
                  resetStatus.startsWith('Success')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {resetStatus.startsWith('Success') ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                )}
                <span>{resetStatus}</span>
              </div>
            )}

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setResettingMember(null);
                  setResetStatus('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetPassword}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Sending Link...' : 'Send Reset Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

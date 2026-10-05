import { Member, Payment, Seetu, AppSettings } from '../types';

export function exportMembersToCSV(members: Member[], weeklyAmount = 100) {
  const headers = [
    'Member ID',
    'Full Name',
    'Mobile Number',
    'Email',
    'Address',
    'Number of Seetus',
    'Weekly Payment (INR)',
    'Status',
    'Joining Date',
    'Notes',
  ];
  const rows = members.map((m) => [
    `"${m.memberId}"`,
    `"${m.fullName.replace(/"/g, '""')}"`,
    `"${m.mobileNumber}"`,
    `"${(m.email || '').replace(/"/g, '""')}"`,
    `"${(m.address || '').replace(/"/g, '""')}"`,
    m.numberOfSeetus,
    m.numberOfSeetus * weeklyAmount,
    `"${m.status || 'Active'}"`,
    `"${m.joiningDate}"`,
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);

  downloadCSV(
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
    `Jothi_Cheettu_Members_${getTimestamp()}.csv`
  );
}

export function exportPaymentsToCSV(payments: Payment[]) {
  const headers = [
    'Receipt No',
    'Payment ID',
    'Member Name',
    'Member ID',
    'Seetu ID',
    'Week Number',
    'Payment Date',
    'Amount (INR)',
    'Payment Mode',
    'Notes',
  ];
  const rows = payments.map((p) => [
    `"${p.receiptNo}"`,
    `"${p.paymentId}"`,
    `"${p.memberName.replace(/"/g, '""')}"`,
    `"${p.memberId}"`,
    `"${p.seetuId}"`,
    p.weekNumber,
    `"${p.paymentDate}"`,
    p.amount,
    `"${p.paymentMethod}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
  ]);

  downloadCSV(
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
    `Jothi_Cheettu_Payments_${getTimestamp()}.csv`
  );
}

export function exportFinancialSummaryToCSV(summary: {
  totalCollected: number;
  totalPending: number;
  totalMembers: number;
  totalSeetus: number;
  completedSeetus: number;
  activeSeetus: number;
  totalMaturityLiability: number;
  totalExtraBonus: number;
}) {
  const rows = [
    'Metric,Value',
    `Total Money Collected,INR ${summary.totalCollected}`,
    `Total Pending / Due from Members,INR ${summary.totalPending}`,
    `Total Members,${summary.totalMembers}`,
    `Total Seetus,${summary.totalSeetus}`,
    `Active Seetus,${summary.activeSeetus}`,
    `Completed Seetus,${summary.completedSeetus}`,
    `Total Expected Maturity Payout,INR ${summary.totalMaturityLiability}`,
    `Total Extra / Interest Bonus,INR ${summary.totalExtraBonus}`,
    `Generated On,${new Date().toLocaleString()}`,
  ];

  downloadCSV(
    rows.join('\n'),
    `Jothi_Cheettu_Financial_Summary_${getTimestamp()}.csv`
  );
}

export function downloadBackupJSON(data: {
  members: Member[];
  seetus: Seetu[];
  payments: Payment[];
  settings: AppSettings;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jothi_Cheettu_Backup_${getTimestamp()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

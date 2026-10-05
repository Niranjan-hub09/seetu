export type UserRole = 'admin' | 'member';

export interface Member {
  id: string;
  memberId: string; // e.g. M001
  uid?: string; // Firebase Authentication UID
  fullName: string;
  mobileNumber: string;
  email: string;
  address: string;
  numberOfSeetus: number; // e.g. 1, 2, 3
  joiningDate: string; // YYYY-MM-DD
  notes?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  password?: string;
  isFirebaseAuth?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type SeetuStatus = 'Active' | 'Completed' | 'Pending' | 'Matured';

export interface Seetu {
  id: string;
  seetuId: string; // e.g. S001, S002
  memberId: string;
  uid?: string; // Linked Firebase Auth UID for member isolation
  memberName: string;
  memberMobile: string;
  memberEmail?: string;
  weeklyAmount: number; // default ₹100
  totalWeeks: number; // default 51
  totalExpectedAmount: number; // e.g. 51 * 100 = 5100
  weeksPaid: number;
  weeksRemaining: number;
  amountPaid: number;
  amountRemaining: number;
  startDate: string;
  maturityDate: string;
  extraInterestAmount: number; // e.g. 300
  maturityAmount: number; // 5100 + 300 = 5400
  status: SeetuStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  paymentId: string; // e.g. PAY-1234
  memberId: string;
  uid?: string; // Linked Firebase Auth UID for member isolation
  memberName: string;
  seetuId: string;
  weekNumber: number; // 1 to 51
  paymentDate: string; // YYYY-MM-DD
  amount: number; // default 100
  paymentMethod: 'Cash' | 'GPay / UPI' | 'Bank Transfer' | 'Other';
  notes?: string;
  receiptNo: string;
  createdAt: string;
}

export type MaturityStatus = 'Eligible' | 'Settled' | 'Pending';

export interface Maturity {
  id: string;
  maturityId: string;
  seetuId: string;
  memberId: string;
  uid?: string; // Linked Firebase Auth UID for member isolation
  memberName: string;
  memberMobile: string;
  memberEmail?: string;
  totalContribution: number; // 5100
  extraInterestAmount: number; // 300
  maturityAmount: number; // 5400
  maturityDate: string;
  status: MaturityStatus;
  settledDate?: string;
  settledNotes?: string;
  createdAt: string;
}

export interface AppSettings {
  cheettuName: string;
  chithiName?: string; // For backward compatibility
  organizerName: string;
  mobileNumber: string;
  adminEmail: string;
  upiId: string;
  gpayNumber: string;
  qrCodeUrl: string;
  weeklyAmount: number; // default ₹100
  totalWeeks: number; // default 51
  defaultExtraAmount: number; // default ₹300
  businessAddress: string;
  adminPasscode: string; // organizer login passcode
  disclaimer: string;
  updatedAt?: string;
}

export interface PendingMemberRecord {
  member: Member;
  seetus: Seetu[];
  expectedWeeklyAmount: number;
  totalPaid: number;
  totalPendingAmount: number;
  pendingWeeksCount: number;
  lastPaymentDate?: string;
}

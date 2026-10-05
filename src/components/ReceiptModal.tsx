import React, { useRef } from 'react';
import { useChithi } from '../context/ChithiContext';
import { formatINR } from '../utils/translations';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  MessageCircle,
  Building2,
  FileCheck,
} from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const {
    activeReceiptPayment,
    closeReceiptModal,
    settings,
    seetus,
    members,
    sendWhatsAppMessage,
  } = useChithi();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceiptPayment) return null;

  const payment = activeReceiptPayment;
  const currentSeetu = seetus.find((s) => s.seetuId === payment.seetuId);
  const currentMember = members.find((m) => m.memberId === payment.memberId);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppReceipt = () => {
    if (!currentMember) return;
    const msg = `🧾 *JOTHI CHEETTU RECEIPT* 🧾\n` +
      `*${settings.cheettuName}*\n\n` +
      `*Receipt No:* ${payment.receiptNo}\n` +
      `*Member:* ${payment.memberName} (${payment.memberId})\n` +
      `*Seetu ID:* ${payment.seetuId}\n` +
      `*Week:* ${payment.weekNumber} of 51\n` +
      `*Amount Paid:* ${formatINR(payment.amount)}\n` +
      `*Date:* ${payment.paymentDate}\n` +
      `*Status:* PAID ✓ (${payment.paymentMethod})\n\n` +
      `*Total Paid:* ${formatINR(currentSeetu?.amountPaid || payment.amount)} / ₹5,100\n` +
      `*Remaining Balance:* ${formatINR(currentSeetu?.amountRemaining || 0)}\n\n` +
      `Organizer: ${settings.organizerName} (${settings.mobileNumber})\n` +
      `_This receipt is generated for personal record-keeping._`;

    sendWhatsAppMessage(currentMember.mobileNumber, msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={closeReceiptModal}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Slip Container */}
        <div
          ref={receiptRef}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50 print:border-solid print:border-black print:bg-white"
        >
          {/* Slip Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase block mb-1">
              Official Payment Receipt • சீட்டு ரசீது
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {settings.cheettuName}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Organizer: {settings.organizerName} • Ph: {settings.mobileNumber}
            </p>
            {settings.businessAddress && (
              <p className="text-[10px] text-slate-400 mt-0.5">{settings.businessAddress}</p>
            )}
          </div>

          {/* Receipt Details Grid */}
          <div className="py-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-mono font-bold text-slate-800">{payment.receiptNo}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Date:</span>
              <span className="font-semibold text-slate-800">{payment.paymentDate}</span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-500">Member Name:</span>
              <span className="font-bold text-slate-900">
                {payment.memberName} ({payment.memberId})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Seetu Slot ID:</span>
              <span className="font-mono font-bold text-emerald-800">{payment.seetuId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Scheme Week:</span>
              <span className="font-bold text-slate-800">
                Week {payment.weekNumber} of 51 Weeks
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-slate-700">{payment.paymentMethod}</span>
            </div>

            {/* Highlighted Amount Box */}
            <div className="my-2 p-3 bg-emerald-100/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Amount Paid
                </span>
                <span className="text-xl font-extrabold text-emerald-900">
                  {formatINR(payment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAID</span>
                </span>
              </div>
            </div>

            {/* Running Balance */}
            {currentSeetu && (
              <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Total Weeks Paid:</span>
                  <span className="font-bold text-slate-800">
                    {currentSeetu.weeksPaid} / 51 Weeks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Accumulated Paid:</span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(currentSeetu.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-amber-700">
                    {formatINR(currentSeetu.amountRemaining)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Slip Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
            <div>
              <p>Generated digitally</p>
              <p>Non-banking record voucher</p>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-600">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="flex items-center justify-between gap-2 mt-5 print:hidden">
          <button
            onClick={handleSendWhatsAppReceipt}
            className="flex-1 py-2.5 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

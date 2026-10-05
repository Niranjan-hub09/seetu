import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { formatINR } from '../utils/translations';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  CreditCard,
} from 'lucide-react';

export const GPayModal: React.FC = () => {
  const { isGPayModalOpen, setIsGPayModalOpen, settings } = useChithi();
  const [copied, setCopied] = useState(false);

  if (!isGPayModalOpen) return null;

  const upiId = settings.upiId || 'jothicheettu@okhdfcbank';
  const phone = settings.gpayNumber || settings.mobileNumber || '9840123456';
  const organizer = settings.organizerName || 'Jothi Cheettu Organizer';
  const amount = settings.weeklyAmount || 100;

  // Real UPI deep link URL standard (works on mobile phones with GPay, PhonePe, Paytm)
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    organizer
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent('Weekly Jothi Cheettu Payment')}`;

  // QR Code generator URL using standard QR image endpoint
  const qrImageUrl =
    settings.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      upiDeepLink
    )}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative my-6 text-center">
        {/* Close Button */}
        <button
          onClick={() => setIsGPayModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">GPay & UPI Payment Info</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan QR or pay directly to the organizer&apos;s UPI ID.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl inline-block">
          <img
            src={qrImageUrl}
            alt="UPI QR Code"
            className="w-48 h-48 mx-auto rounded-xl shadow-xs"
            loading="lazy"
          />
          <span className="text-[10px] text-slate-400 font-medium block mt-2">
            Scan with Google Pay, PhonePe, or Paytm
          </span>
        </div>

        {/* UPI Details Box */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left space-y-2 text-xs mb-5">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Organizer</span>
            <span className="font-bold text-slate-800">{organizer}</span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Google Pay Number
              </span>
              <span className="font-mono font-semibold text-slate-800">{phone}</span>
            </div>
            <a
              href={`tel:${phone}`}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
            >
              Call
            </a>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">UPI ID</span>
              <span className="font-mono font-bold text-emerald-800 break-all">{upiId}</span>
            </div>
            <button
              onClick={handleCopyUPI}
              className="p-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-slate-600 hover:text-emerald-700 transition cursor-pointer"
              title="Copy UPI ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Pay via UPI App deep link button */}
        <a
          href={upiDeepLink}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer mb-3"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pay via Google Pay / UPI App</span>
        </a>

        {/* Notice */}
        <p className="text-[10px] text-slate-400 leading-tight">
          Note: This triggers external payment via your mobile UPI app. After paying, inform the organizer to record your weekly contribution voucher.
        </p>
      </div>
    </div>
  );
};

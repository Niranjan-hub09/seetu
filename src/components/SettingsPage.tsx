import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { AppSettings } from '../types';
import { translations, formatINR } from '../utils/translations';
import {
  exportMembersToCSV,
  exportPaymentsToCSV,
  downloadBackupJSON,
} from '../utils/exportUtils';
import {
  Settings as SettingsIcon,
  Save,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateAppSettings,
    clearDatabase,
    members,
    seetus,
    payments,
    language,
  } = useChithi();
  const t = translations[language];

  const [formData, setFormData] = useState<AppSettings>({
    ...settings,
    cheettuName: settings.cheettuName || settings.chithiName || 'ஜோதி சீட்டு (Jothi Cheettu)',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateAppSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAllData = async () => {
    await clearDatabase();
    setConfirmClear(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            <span>{t.settings}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure scheme terms, weekly contribution rates, organizer payment details, and backups for Jothi Cheettu.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Scheme Rules & Contributions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <span>1. Scheme Terms & Contribution Calculations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Weekly Seetu Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.weeklyAmount}
                onChange={(e) =>
                  setFormData({ ...formData, weeklyAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold text-emerald-800"
                required
                min={10}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹100 per week</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Scheme Duration (Weeks) *
              </label>
              <input
                type="number"
                value={formData.totalWeeks}
                onChange={(e) =>
                  setFormData({ ...formData, totalWeeks: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold"
                required
                min={1}
                max={100}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Standard: 51 weeks</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maturity Extra Bonus / Interest (₹) *
              </label>
              <input
                type="number"
                value={formData.defaultExtraAmount}
                onChange={(e) =>
                  setFormData({ ...formData, defaultExtraAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold text-purple-800"
                required
                min={0}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Configurable: ₹300 extra</span>
            </div>
          </div>

          {/* Scheme Result Formula Preview */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-emerald-900 block">Calculation Summary:</span>
            <div className="text-emerald-800 text-[11px]">
              • 1 Seetu Total Contribution = {formData.totalWeeks} weeks × ₹{formData.weeklyAmount} ={' '}
              <span className="font-bold">{formatINR(formData.totalWeeks * formData.weeklyAmount)}</span>
            </div>
            <div className="text-emerald-800 text-[11px]">
              • Payout with Extra Bonus = {formatINR(formData.totalWeeks * formData.weeklyAmount)} +{' '}
              {formatINR(formData.defaultExtraAmount)} ={' '}
              <span className="font-extrabold text-emerald-950">
                {formatINR(
                  formData.totalWeeks * formData.weeklyAmount + formData.defaultExtraAmount
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Organizer & Branding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <span>2. Jothi Cheettu Organizer Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Scheme / Brand Name *
              </label>
              <input
                type="text"
                value={formData.cheettuName}
                onChange={(e) => setFormData({ ...formData, cheettuName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organizer Contact Name
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Admin Login Passcode
              </label>
              <input
                type="text"
                value={formData.adminPasscode}
                onChange={(e) => setFormData({ ...formData, adminPasscode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Business / Address</label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: GPay & UPI Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <span>3. Google Pay & UPI Payment Setup</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Google Pay UPI ID</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. jothicheettu@okhdfcbank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Pay Mobile Number
              </label>
              <input
                type="tel"
                value={formData.gpayNumber}
                onChange={(e) => setFormData({ ...formData, gpayNumber: e.target.value })}
                placeholder="e.g. 9840123456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Custom QR Code Image URL (Optional)
              </label>
              <input
                type="text"
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                placeholder="Leave blank to automatically generate dynamic UPI QR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Section 4: Backup & Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          <span>4. Data Backup & CSV Export</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() =>
              downloadBackupJSON({
                members,
                seetus,
                payments,
                settings,
              })
            }
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-start gap-3 cursor-pointer"
          >
            <Download className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Download Full JSON Backup</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Save complete records of members, seetus, and payments.
              </p>
            </div>
          </button>

          <button
            onClick={() => exportMembersToCSV(members, settings.weeklyAmount)}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-start gap-3 cursor-pointer"
          >
            <Download className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Export Members CSV</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download spreadsheet with member names, email, and phone numbers.
              </p>
            </div>
          </button>

          <button
            onClick={() => exportPaymentsToCSV(payments)}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-start gap-3 cursor-pointer"
          >
            <Download className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Export Payments CSV</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download full payment receipt records for accounting.
              </p>
            </div>
          </button>
        </div>

        {/* Clear Database Danger Zone */}
        <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-red-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Clear All Data</span>
            </h4>
            <p className="text-[11px] text-red-700 mt-0.5">
              Permanently wipes all members, seetus, payments, and maturities from the database.
            </p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Yes, Wipe Everything
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset / Clear Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useChithi } from '../context/ChithiContext';
import { formatINR } from '../utils/translations';
import {
  X,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Lock,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addNewMember, settings } = useChithi();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [numberOfSeetus, setNumberOfSeetus] = useState<number | ''>('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthNotAllowed, setIsAuthNotAllowed] = useState(false);

  if (!isOpen) return null;

  const seetuCountNumber = Number(numberOfSeetus) || 0;
  const weeklyUnit = settings.weeklyAmount || 100;
  const weeklyDue = seetuCountNumber * weeklyUnit;
  const totalWeeks = settings.totalWeeks || 51;
  const totalMaturityExpected =
    seetuCountNumber * (weeklyUnit * totalWeeks + (settings.defaultExtraAmount || 300));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAuthNotAllowed(false);

    if (!fullName.trim()) {
      setErrorMsg('Please enter member name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('Please enter mobile number.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter member email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long for login security.');
      return;
    }
    if (!numberOfSeetus || Number(numberOfSeetus) < 1) {
      setErrorMsg('Please enter a valid number of seetus (minimum 1).');
      return;
    }

    setIsSubmitting(true);
    try {
      await addNewMember({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        numberOfSeetus: Number(numberOfSeetus),
        joiningDate,
        password,
        notes: notes.trim(),
      });

      // Reset form to empty
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setAddress('');
      setNumberOfSeetus('');
      setPassword('');
      setNotes('');
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const msg = err instanceof Error ? err.message : String(err);
      if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        setIsAuthNotAllowed(true);
        setErrorMsg(
          'Firebase Authentication "Email/Password" sign-in method is currently disabled in your Firebase console project.'
        );
      } else {
        setErrorMsg(msg || 'Failed to create member');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDirectly = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await addNewMember(
        {
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: email.trim(),
          address: address.trim(),
          numberOfSeetus: Number(numberOfSeetus),
          joiningDate,
          password,
          notes: notes.trim(),
        },
        { allowFallback: true }
      );

      // Reset form to empty
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setAddress('');
      setNumberOfSeetus('');
      setPassword('');
      setNotes('');
      setIsAuthNotAllowed(false);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save member to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Member</h3>
            <p className="text-xs text-slate-500">
              Create member profile and login credentials for Jothi Cheettu.
            </p>
          </div>
        </div>

        {isAuthNotAllowed ? (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Firebase Setup: Enable Email/Password Provider
                </h4>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Firebase project <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">robust-house-1psvl</code> has Email/Password authentication disabled by default.
                </p>
              </div>
            </div>

            <div className="bg-white/90 border border-amber-200 rounded-xl p-3 text-[11px] space-y-1.5 text-slate-700">
              <p className="font-bold text-slate-900">Quick 10-second fix in Firebase Console:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 font-medium">
                <li>Click <span className="font-bold text-amber-800">"Open Firebase Console"</span> below</li>
                <li>Under Sign-in providers, click <span className="font-bold text-slate-900">Email/Password</span></li>
                <li>Turn the <span className="font-bold text-emerald-700">Enable</span> toggle ON and click <span className="font-bold text-slate-900">Save</span></li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://console.firebase.google.com/project/robust-house-1psvl/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleSaveDirectly}
                disabled={isSubmitting}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Member to Database Now</span>
              </button>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter member name"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (for Login) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter member email"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password & Number of Seetus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (Member Login) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create member password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Seetus *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  value={numberOfSeetus}
                  onChange={(e) =>
                    setNumberOfSeetus(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Enter number of seetus"
                  min={1}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Joining Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          {seetuCountNumber > 0 && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-semibold text-emerald-950 flex justify-between items-center mb-1">
                <span>Calculated Contribution:</span>
                <span className="font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                  {formatINR(weeklyDue)} / week
                </span>
              </div>
              <div className="text-[11px] text-emerald-800">
                • {seetuCountNumber} Seetus × ₹{weeklyUnit}/wk = {formatINR(weeklyDue)} per week
              </div>
              <div className="text-[11px] text-emerald-800">
                • 51-Week Contribution = {formatINR(weeklyDue * totalWeeks)}
              </div>
              <div className="text-[11px] text-emerald-800">
                • Total Maturity Value = {formatINR(totalMaturityExpected)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Create Member Login'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, Lock } from 'lucide-react';
import { HOSTELS } from '../data/menuData';
import { useAuth } from '../context/AuthContext';
import api, { authService } from '../services/api';

export const LoginPage = ({ onBack, onSuccess, initialHostel = 'bh1' }) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ hostel: initialHostel, roomNumber: '', pin: '' });
  // CHANGED BY COPILOT — added localError state for login error handling
  const [localError, setLocalError] = useState('');

  // First login state
  const [firstLogin, setFirstLogin] = useState(null); // holds { userId, hostel, roomNumber }
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    try {
      const result = await login(formData.hostel, formData.roomNumber, formData.pin);
      if (result?.isFirstLogin) {
        setFirstLogin({
          userId: result.userId,
          hostel: result.hostel,
          roomNumber: result.roomNumber,
          currentPin: formData.pin,
        });
      } else {
        onSuccess?.();
      }
    } catch (err) {
      // CHANGED BY COPILOT — capture login error in localError state
      setLocalError(err.message || 'Login failed.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError('');

    // 🗑️ DUMMY PASSWORD CHANGE - No actual password verification
    setChangeLoading(true);
    try {
      // Fake delay
      await new Promise(resolve => setTimeout(resolve, 500));
      await login(formData.hostel, formData.roomNumber, newPassword);
      onSuccess?.();
    } catch (err) {
      setChangeError('Dummy password change error');
    } finally {
      setChangeLoading(false);
    }
  };

  // ── SET NEW PASSWORD SCREEN ──
  if (firstLogin) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
            <div className="h-0.5 bg-[#2563eb]" />
            <div className="p-7">

              {/* Header */}
              <div className="text-center mb-7">
                <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-3">
                  <Lock size={20} color="#2563eb" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight mb-1">
                  Set Your Password
                </h2>
                <p className="text-xs text-[#94a3b8]">
                  Room {firstLogin.roomNumber} · First login detected
                </p>
                <p className="text-xs text-[#64748b] mt-2">
                  Choose a new password (4-20 characters)
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">

                {changeError && (
                  <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm font-semibold text-[#dc2626]">
                    {changeError}
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    maxLength={20}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    maxLength={20}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changeLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2563eb] text-white text-sm font-bold
                    ${changeLoading ? 'bg-[#93c5fd] cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8]'}`}
                >
                  {changeLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Password →'}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL LOGIN SCREEN ──
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 mb-6 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-semibold hover:border-[#bfdbfe] hover:text-[#2563eb]"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
          <div className="h-0.5 bg-[#2563eb]" />
          <div className="p-7">

            <div className="text-center mb-7">
              <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-3">
                <KeyRound size={20} color="#2563eb" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight mb-1">
                Enter to Rate
              </h2>
              <p className="text-xs text-[#94a3b8] tracking-wider">
                Hostel · Room Number · Password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* CHANGED BY COPILOT — detailed login error message */}
              {localError && (
                <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm text-[#dc2626]">
                  <p className="font-extrabold mb-1">❌ Login Failed</p>
                  <p className="font-semibold">We sincerely apologize! A technical issue may have reset your password. Please use your original password from the PDF shared on the WhatsApp group.</p>
                  <p className="mt-1 text-xs">If still unable to login, contact developer — <strong>Aditya Yadav · BH1 Room 108 · 9398672820</strong></p>
                </div>
              )}
              {/* END CHANGED BY COPILOT */}

              {/* Hostel */}
              <div>
                <label className="block mb-2.5 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                  Hostel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HOSTELS.map((hostel) => {
                    const isActive = formData.hostel === hostel.id;
                    return (
                      <button
                        key={hostel.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hostel: hostel.id }))}
                        className={`px-3 py-2.5 rounded-xl text-left text-sm font-bold border
                          ${isActive
                            ? 'border-[#2563eb] bg-[#eff6ff] text-[#2563eb]'
                            : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#bfdbfe]'
                          }`}
                      >
                        {hostel.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                  Room Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="e.g. 302"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  maxLength={20}
                  value={formData.pin}
                  onChange={e => {
                    // CHANGED BY COPILOT — clear error when user starts typing password
                    setLocalError('');
                    setFormData(prev => ({ ...prev, pin: e.target.value }));
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2563eb] text-white text-sm font-bold
                  ${isLoading ? 'bg-[#93c5fd] cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8]'}`}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Continue →'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
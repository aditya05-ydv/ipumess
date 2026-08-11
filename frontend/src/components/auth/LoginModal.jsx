import { useState } from 'react';
import { X, User, Loader2, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const LoginModal = ({ onClose, mode = 'user' }) => {
  const { login, adminLogin, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ hostel: 'bh1', roomNumber: '', pin: '' });
  const [localError, setLocalError] = useState('');

  // First login state
  const [firstLogin, setFirstLogin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (mode === 'admin') {
        await adminLogin(formData.hostel, formData.pin);
        onClose();
      } else {
        const result = await login(formData.hostel, formData.roomNumber, formData.pin);
        if (result?.isFirstLogin) {
          setFirstLogin({
            userId: result.userId,
            currentPin: formData.pin,
          });
        } else {
          onClose();
        }
      }
    } catch (err) {
      console.log('CATCH ERROR:', err.message);
      setLocalError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError('');

    // 🗑️ DUMMY PASSWORD CHANGE - No actual password validation
    setChangeLoading(true);
    try {
      // Fake delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (err) {
      setChangeError('Dummy password change error');
    } finally {
      setChangeLoading(false);
    }
  };

  // ── SET NEW PASSWORD SCREEN ──
  if (firstLogin) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/10"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl relative bg-white border border-[#e2e8f0]"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-t-2xl" />

          <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg text-[#64748b] hover:text-[#0f172a]">
            <X size={18} />
          </button>

          <div className="text-center mb-7 pt-2">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-3">
              <Lock size={20} color="#2563eb" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0f172a] mb-1">Set Your Password</h3>
            <p className="text-xs text-[#94a3b8]">First login — choose a new password (4-20 characters)</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {changeError && (
              <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm font-semibold text-[#dc2626]">
                {changeError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] mb-2">New Password</label>
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
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] mb-2">Confirm Password</label>
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

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl font-medium border border-[#e2e8f0] text-[#64748b] bg-white">
                Cancel
              </button>
              <button type="submit" disabled={changeLoading}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center gap-2 disabled:opacity-50">
                {changeLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── NORMAL LOGIN ──
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl relative bg-white border border-[#e2e8f0]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-t-2xl" />

        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg text-[#64748b] hover:text-[#0f172a]">
          <X size={18} />
        </button>

        <div className="text-center mb-7 pt-2">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-3">
            {mode === 'admin' ? <Shield size={20} color="#2563eb" /> : <User size={20} color="#2563eb" />}
          </div>
          <h3 className="text-xl font-extrabold text-[#0f172a] mb-1">
            {mode === 'admin' ? 'Admin Login' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-[#94a3b8]">
            {mode === 'admin' ? 'Enter admin credentials.' : 'Login to rate food and participate in polls.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CHANGED BY COPILOT — detailed login error message */}
          {localError && mode === 'user' && (
            <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm text-[#dc2626]">
              <p className="font-extrabold mb-1">❌ Login Failed</p>
              <p className="font-semibold">We sincerely apologize! A technical issue may have reset your password. Please use your original password from the PDF shared on the WhatsApp group.</p>
              <p className="mt-1 text-xs">If still unable to login, contact developer — <strong>Aditya Yadav · BH1 Room 108 · 9398672820</strong></p>
            </div>
          )}
          {/* END CHANGED BY COPILOT */}

          {(localError || error) && mode === 'admin' && (
            <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm font-semibold text-[#dc2626]">
              {localError || error}
            </div>
          )}

          {/* Hostel */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] mb-2">Select Hostel</label>
            <select
              value={formData.hostel}
              onChange={e => setFormData({ ...formData, hostel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
            >
              <option value="bh1">Shivalik BH1</option>
              <option value="bh2">Aravali BH2</option>
              <option value="gh1">Satpura GH1</option>
              <option value="gh2">Nilgiri GH2</option>
            </select>
          </div>

          {/* Room Number — user only */}
          {mode === 'user' && (
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] mb-2">Room Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 302"
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] mb-2">
              {mode === 'admin' ? 'Admin Password' : 'Password'}
            </label>
            <input
              type="password"
              required
              maxLength={mode === 'admin' ? 64 : 20}
              placeholder="Enter your password"
              value={formData.pin}
              onChange={e => setFormData({ ...formData, pin: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium border border-[#e2e8f0] text-[#64748b] bg-white">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 rounded-xl font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : mode === 'admin' ? 'Admin Login' : 'Login'}
            </button>
          </div>

          {mode === 'user' && (
            <p className="text-center text-xs text-[#94a3b8]">
              Forgot password? Contact the Mess Admin.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
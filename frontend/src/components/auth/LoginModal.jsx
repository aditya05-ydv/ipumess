import { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginModal = ({ onClose, mode = 'user' }) => {
  const { login, adminLogin, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    hostel: 'bh1',
    roomNumber: '',
    pin: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'admin') {
        await adminLogin(formData.hostel, formData.pin);
      } else {
        await login(formData.hostel, formData.roomNumber, formData.pin);
      }
      onClose();
    } catch (err) {
      // handled by context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(15,23,42,0.12)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-8 rounded-3xl relative overflow-hidden"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'none' }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: '#ffffff' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg transition-all"
          style={{ color: '#64748b', backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            {mode === 'admin'
              ? <Shield size={28} color="#2563eb" />
              : <User size={28} color="#2563eb" />
            }
          </div>
          <h3 className="text-2xl font-black mb-2" style={{ color: '#0f172a' }}>
            {mode === 'admin' ? 'Admin Login' : 'Welcome Back'}
          </h3>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {mode === 'admin'
              ? 'Enter admin credentials to manage menus and polls.'
              : 'Login to rate food and participate in polls.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
            >
              {error}
            </div>
          )}

          {/* Hostel Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
              Select Hostel
            </label>
            <select
              value={formData.hostel}
              onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer font-medium"
              style={{ backgroundColor: '#111827', border: '1px solid #e2e8f0', color: '#F1F5F9' }}
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
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
                Room Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 302"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                style={{ backgroundColor: '#111827', border: '1px solid #e2e8f0', color: '#F1F5F9' }}
              />
            </div>
          )}

          {/* PIN / Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
              {mode === 'admin' ? 'Admin Password' : '4-Digit PIN'}
            </label>
            <input
              type="password"
              required
              maxLength={mode === 'admin' ? 64 : 4}
              placeholder={mode === 'admin' ? 'Password' : '••••'}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none font-medium tracking-widest"
              style={{ backgroundColor: '#111827', border: '1px solid #e2e8f0', color: '#F1F5F9' }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium transition-all"
              style={{ backgroundColor: '#111827', border: '1px solid #e2e8f0', color: '#94a3b8' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: '#2563eb' }}
            >
              {isLoading
                ? <Loader2 className="animate-spin" size={18} />
                : mode === 'admin' ? 'Admin Login' : 'Login'
              }
            </button>
          </div>

          {/* Hint */}
          {mode === 'user' && (
            <p className="text-center text-xs italic" style={{ color: '#475569' }}>
              Forgot PIN? Contact the Mess Secretary.
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

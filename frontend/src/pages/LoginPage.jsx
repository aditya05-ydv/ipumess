import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { HOSTELS } from '../data/menuData';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onBack, onSuccess, initialHostel = 'bh1' }) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ hostel: initialHostel, roomNumber: '', pin: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(formData.hostel, formData.roomNumber, formData.pin);
      onSuccess?.();
    } catch (_) {}
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 mb-6 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-semibold cursor-pointer hover:border-[#bfdbfe] hover:text-[#2563eb] transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
          <div className="h-0.5 bg-[#2563eb]" />

          <div className="p-7">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-3">
                <KeyRound size={20} color="#2563eb" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight mb-1">
                Enter to Rate
              </h2>
              <p className="text-xs text-[#94a3b8] tracking-wider">
                Hostel · Room Number · Access Code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm font-semibold text-[#dc2626]">
                  {error}
                </div>
              )}

              {/* Hostel selector */}
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
                        className={`px-3 py-2.5 rounded-xl text-left text-sm font-bold cursor-pointer border transition-colors
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
                  type="number"
                  required
                  value={formData.roomNumber}
                  onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="e.g. 302"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-sm outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              {/* PIN */}
              <div>
                <label className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                  Access Code (PIN)
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={formData.pin}
                  onChange={e => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] text-lg tracking-[0.3em] outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2563eb] text-white text-sm font-bold transition-colors cursor-pointer
                  ${isLoading ? 'bg-[#93c5fd] cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8]'}`}
              >
                {isLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : 'Continue →'
                }
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
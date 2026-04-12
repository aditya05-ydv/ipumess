import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { HOSTELS } from '../data/menuData';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

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
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: '#0d1017',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Back */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginBottom: '24px', padding: '8px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <ArrowLeft size={15} /> Back
        </motion.button>

        {/* Card */}
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.2)',
          background: 'linear-gradient(160deg, #161b27 0%, #111520 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Top accent */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #4f46e5 0%, #a78bfa 50%, #6366f1 100%)' }} />

          <div style={{ padding: '32px 28px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 14px',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <KeyRound size={20} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Enter to Rate
              </h2>
              <p style={{ fontSize: '12px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em' }}>
                Hostel · Room Number · Access Code
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Error */}
              {error && (
                <div style={{
                  borderRadius: '9px', padding: '12px 14px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  fontSize: '13px', fontWeight: 600, color: '#fca5a5',
                  fontFamily: '"DM Sans", sans-serif',
                }}>
                  {error}
                </div>
              )}

              {/* Hostel selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>
                  Hostel
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {HOSTELS.map((hostel) => {
                    const isActive = formData.hostel === hostel.id;
                    return (
                      <motion.button
                        key={hostel.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hostel: hostel.id }))}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '10px 12px', borderRadius: '9px', textAlign: 'left',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                          color: isActive ? '#a5b4fc' : '#94a3b8',
                          fontSize: '13px', fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                          boxShadow: isActive ? '0 0 0 1px rgba(99,102,241,0.2)' : 'none',
                        }}
                      >
                        {hostel.name.split(' ')[0]}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>
                  Room Number
                </label>
                <input
                  type="number"
                  required
                  value={formData.roomNumber}
                  onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="e.g. 302"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px', borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#e2e8f0', fontSize: '14px',
                    fontFamily: '"DM Sans", sans-serif',
                    outline: 'none', transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
              </div>

              {/* PIN */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>
                  Access Code (PIN)
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={formData.pin}
                  onChange={e => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px', borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#e2e8f0', fontSize: '18px', letterSpacing: '0.3em',
                    fontFamily: '"DM Mono", monospace',
                    outline: 'none', transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.01 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                style={{
                  marginTop: '4px',
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px', borderRadius: '10px',
                  background: isLoading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  fontFamily: '"DM Sans", sans-serif', cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Continue →'}
              </motion.button>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
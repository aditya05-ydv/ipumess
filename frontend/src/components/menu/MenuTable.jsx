import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, LogIn, ChevronRight, Utensils, Lock } from 'lucide-react';
import { HOSTELS } from '../../data/menuData';
import { menuService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canRateMeal, getMealLockReason } from '../../utils/timeUtils';

const MEAL_COLORS = {
  breakfast: { dot: 'bg-amber-400',   label: 'text-amber-400'   },
  lunch:     { dot: 'bg-emerald-400', label: 'text-emerald-400' },
  snacks:    { dot: 'bg-sky-400',     label: 'text-sky-400'     },
  dinner:    { dot: 'bg-violet-400',  label: 'text-violet-400'  },
};

// Check if user can rate this hostel
const getHostelRatingStatus = (user, hostelId) => {
  if (!user) return { canRate: false, reason: 'not_logged_in' };
  if (user.hostelId !== hostelId) return { canRate: false, reason: 'wrong_hostel' };
  return { canRate: true, reason: null };
};

export const MenuTable = ({ hostelId, onDayClick, onSelectHostel, onSignInClick }) => {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const hostel = useMemo(() => HOSTELS.find((item) => item.id === hostelId), [hostelId]);
  const hostelStatus = getHostelRatingStatus(user, hostelId);

  // Show toast message
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Handle row click with checks
  const handleRowClick = (row) => {
    if (!user) {
      showToast('Please login to rate meals.');
      return;
    }
    if (hostelStatus.reason === 'wrong_hostel') {
      const correctHostel = HOSTELS.find(h => h.id === user.hostelId);
      showToast(`You are logged in to ${correctHostel?.name || user.hostel}. Please login to ${hostel?.name} to rate this menu.`);
      return;
    }
    onDayClick(row);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      setIsError('');
      try {
        const data = await menuService.getMenu(hostelId);
        setMenu(data.weeklyMenu || []);
      } catch (error) {
        setIsError('Unable to fetch menu. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [hostelId]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 pb-28 sm:pb-12">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-[200]"
            style={{ transform: 'translateX(-50%)', maxWidth: '90vw' }}
          >
            <div style={{
              backgroundColor: '#1E2A3A',
              border: '1px solid #F59E0B',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#FCD34D',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'center',
            }}>
              <Lock size={14} color="#F59E0B" />
              {toastMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hostel Rating Status Banner */}
      {user && hostelStatus.reason === 'wrong_hostel' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          <Lock size={15} color="#F59E0B" />
          <p style={{ color: '#FCD34D', fontSize: '13px', fontWeight: 500 }}>
            You are viewing <strong>{hostel?.name}</strong> menu.
            Login to <strong>{hostel?.name}</strong> to rate meals here.
            Your hostel: <strong>{HOSTELS.find(h => h.id === user.hostelId)?.name || user.hostel}</strong>
          </p>
        </motion.div>
      )}

      {/* Hostel Selector */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, #1a1f2e 0%, #141820 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          marginBottom: '20px',
        }}
      >
        <p style={{
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#4b5563', marginBottom: '14px',
        }}>
          Select Hostel
        </p>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}
          className="no-scrollbar">
          {HOSTELS.map((item) => {
            const isActive = hostelId === item.id;
            const isMyHostel = user?.hostelId === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onSelectHostel(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  minWidth: '148px', flexShrink: 0,
                  borderRadius: '10px', padding: '12px 14px',
                  textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)'
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <p style={{
                  fontSize: '13px', fontWeight: 700,
                  color: isActive ? '#a5b4fc' : '#e2e8f0',
                  marginBottom: '3px',
                }}>
                  {item.name.split(' ')[0]}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: isActive ? '#818cf8' : isMyHostel ? '#10B981' : '#4b5563',
                }}>
                  {isActive ? '● Active' : isMyHostel ? '★ Your Hostel' : 'Tap to view'}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Menu Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        style={{
          background: 'linear-gradient(160deg, #161b27 0%, #111520 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Card Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Utensils size={18} color="#818cf8" />
          </div>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: 800,
              color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {hostel?.name || 'Hostel Menu'}
            </h2>
            <p style={{
              fontSize: '11px', color: '#4b5563',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px',
            }}>
              Weekly Dining Schedule
              {!hostelStatus.canRate && user && (
                <span style={{ color: '#F59E0B', marginLeft: '8px' }}>
                  · Read Only
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Meal Legend */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {Object.entries(MEAL_COLORS).map(([meal, color]) => (
            <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%' }} className={color.dot} />
              <span style={{ fontSize: '11px', textTransform: 'capitalize', letterSpacing: '0.06em' }} className={color.label}>
                {meal}
              </span>
            </div>
          ))}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '240px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Loader2 size={22} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '12px', color: '#4b5563', letterSpacing: '0.1em' }}>LOADING MENU...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {!isLoading && isError && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', padding: '14px 16px',
              color: '#fca5a5', fontSize: '13px', fontWeight: 600,
            }}>
              {isError}
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Day', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((col, i) => (
                    <th key={col} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.16em', textTransform: 'uppercase',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      color: i === 0 ? '#6b7280' : i === 1 ? '#fbbf24' : i === 2 ? '#34d399' : i === 3 ? '#38bdf8' : '#a78bfa',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menu.map((row, index) => {
                  const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
                  const mealColors = ['#fbbf24', '#34d399', '#38bdf8', '#a78bfa'];

                  return (
                    <motion.tr
                      key={row.day}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onHoverStart={() => setHoveredRow(row.day)}
                      onHoverEnd={() => setHoveredRow(null)}
                      onClick={() => handleRowClick(row)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: hoveredRow === row.day ? 'rgba(99,102,241,0.06)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Day cell */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '7px',
                            background: hoveredRow === row.day ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            border: hoveredRow === row.day ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease', flexShrink: 0,
                          }}>
                            <ChevronRight size={13} color={hoveredRow === row.day ? '#818cf8' : '#4b5563'} />
                          </div>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: hoveredRow === row.day ? '#a5b4fc' : '#cbd5e1',
                            whiteSpace: 'nowrap',
                          }}>
                            {row.day}
                          </span>
                        </div>
                      </td>

                      {/* Meal cells with lock indicator */}
                      {meals.map((key, i) => {
                        const isLocked = hostelStatus.canRate && !canRateMeal(row.day, key);
                        return (
                          <td key={key} style={{
                            padding: '16px 20px', verticalAlign: 'top',
                            fontSize: '13px', color: '#94a3b8',
                            lineHeight: 1.6, maxWidth: '200px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <span style={{
                                display: 'inline-block', width: '5px', height: '5px',
                                borderRadius: '50%', background: mealColors[i],
                                marginTop: '7px', flexShrink: 0, opacity: 0.7,
                              }} />
                              <span>{row.menu[key]}</span>
                              {isLocked && (
                                <Lock
                                  size={10}
                                  color="#64748B"
                                  style={{ marginTop: '5px', flexShrink: 0 }}
                                  title={getMealLockReason(row.day, key)}
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer hint */}
        {!isLoading && !isError && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#374151' }} />
            <p style={{
              fontSize: '10px', color: '#374151',
              letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>
              {hostelStatus.canRate
                ? 'Tap any row to rate meals • 🔒 = not yet available'
                : user ? 'Viewing in read-only mode • Login to your hostel to rate'
                : 'Login to rate meals'}
            </p>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#374151' }} />
          </div>
        )}
      </motion.div>

      {/* Sign In Banner */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-30 sm:static sm:mt-5"
          style={{
            background: 'linear-gradient(to top, rgba(10,12,18,0.98) 0%, rgba(10,12,18,0.95) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 16px',
          }}
        >
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <motion.button
              onClick={onSignInClick}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                borderRadius: '10px', padding: '14px 24px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              <LogIn size={16} />
              Sign In to Rate Meals
            </motion.button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
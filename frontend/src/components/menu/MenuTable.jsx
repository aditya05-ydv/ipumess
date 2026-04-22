import { useEffect, useMemo, useState } from 'react';
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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

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

      {/* Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed', top: '80px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 200,
            maxWidth: '90vw',
            backgroundColor: '#ffffff',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '12px 20px',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Lock size={14} color="#d97706" />
          {toastMsg}
        </div>
      )}

      {/* Wrong hostel banner */}
      {user && hostelStatus.reason === 'wrong_hostel' && (
        <div
          style={{
            marginBottom: '16px', padding: '12px 16px',
            borderRadius: '10px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          <Lock size={14} color="#d97706" />
          <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 500 }}>
            You are viewing <strong>{hostel?.name}</strong> menu.
            Login to <strong>{hostel?.name}</strong> to rate meals here.
            Your hostel: <strong>{HOSTELS.find(h => h.id === user.hostelId)?.name || user.hostel}</strong>
          </p>
        </div>
      )}

      {/* Hostel Selector */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <p style={{
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#64748b', marginBottom: '14px',
        }}>
          Select Hostel
        </p>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}
          className="no-scrollbar">
          {HOSTELS.map((item) => {
            const isActive = hostelId === item.id;
            const isMyHostel = user?.hostelId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectHostel(item.id)}
                style={{
                  minWidth: '148px', flexShrink: 0,
                  borderRadius: '10px', padding: '12px 14px',
                  textAlign: 'left', cursor: 'pointer',
                  border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#eff6ff' : '#ffffff',
                }}
              >
                <p style={{
                  fontSize: '13px', fontWeight: 700,
                  color: isActive ? '#1d4ed8' : '#475569',
                  marginBottom: '3px',
                }}>
                  {item.name.split(' ')[0]}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: isActive ? '#2563eb' : '#94a3b8',
                }}>
                  {isActive ? '● Active' : isMyHostel ? '★ Your Hostel' : 'Tap to view'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Menu Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Card Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Utensils size={18} color="#2563eb" />
          </div>
          <div>
            <h2 style={{
              fontSize: '18px', fontWeight: 800,
              color: '#0f172a', letterSpacing: '-0.02em',
            }}>
              {hostel?.name || 'Hostel Menu'}
            </h2>
            <p style={{
              fontSize: '11px', color: '#64748b',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px',
            }}>
              Weekly Dining Schedule
              {!hostelStatus.canRate && user && (
                <span style={{ color: '#d97706', marginLeft: '8px' }}>· Read Only</span>
              )}
            </p>
          </div>
        </div>

        {/* Meal Legend */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          padding: '12px 24px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          {Object.entries(MEAL_COLORS).map(([meal, color]) => (
            <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%' }} className={color.dot} />
              <span style={{ fontSize: '11px', textTransform: 'capitalize', color: '#64748b' }}>
                {meal}
              </span>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '240px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={22} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '12px', color: '#64748b', letterSpacing: '0.1em' }}>Loading menu...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '10px', padding: '14px 16px',
              color: '#dc2626', fontSize: '13px', fontWeight: 600,
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
                <tr>
                  {['Day', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((col, i) => (
                    <th key={col} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      borderBottom: '1px solid #e2e8f0',
                      color: i === 0 ? '#0f172a' : '#2563eb',
                      whiteSpace: 'nowrap',
                      background: '#f8fafc',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menu.map((row) => {
                  const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
                  const mealColors = ['#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6'];
                  const isHovered = hoveredRow === row.day;

                  return (
                    <tr
                      key={row.day}
                      onMouseEnter={() => setHoveredRow(row.day)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => handleRowClick(row)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #e2e8f0',
                        background: isHovered ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      {/* Day cell */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '7px',
                            background: isHovered ? '#eff6ff' : '#f8fafc',
                            border: isHovered ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <ChevronRight size={13} color={isHovered ? '#2563eb' : '#94a3b8'} />
                          </div>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: isHovered ? '#0f172a' : '#334155',
                            whiteSpace: 'nowrap',
                          }}>
                            {row.day}
                          </span>
                        </div>
                      </td>

                      {/* Meal cells */}
                      {meals.map((key, i) => {
                        const isLocked = hostelStatus.canRate && !canRateMeal(row.day, key);
                        return (
                          <td key={key} style={{
                            padding: '16px 20px', verticalAlign: 'top',
                            fontSize: '13px', color: '#0f172a',
                            lineHeight: 1.6, maxWidth: '200px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <span style={{
                                display: 'inline-block', width: '5px', height: '5px',
                                borderRadius: '50%', background: mealColors[i],
                                marginTop: '7px', flexShrink: 0,
                              }} />
                              <span style={{ color: '#0f172a' }}>{row.menu[key]}</span>
                              {isLocked && (
                                <Lock
                                  size={10} color="#94a3b8"
                                  style={{ marginTop: '5px', flexShrink: 0 }}
                                  title={getMealLockReason(row.day, key)}
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer hint */}
        {!isLoading && !isError && (
          <div style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <p style={{
              fontSize: '11px', color: '#94a3b8',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {hostelStatus.canRate
                ? 'Tap any row to rate meals · 🔒 = not yet available'
                : user
                  ? 'Viewing in read-only mode · Login to your hostel to rate'
                  : 'Login to rate meals'}
            </p>
          </div>
        )}
      </div>

      {/* Sign In Banner */}
      {!user && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 sm:static sm:mt-5"
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '14px 16px',
          }}
        >
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <button
              onClick={onSignInClick}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                borderRadius: '10px', padding: '14px 24px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
              }}
            >
              <LogIn size={16} />
              Sign In to Rate Meals
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Coffee, Sun, Moon, Cookie, Star, Calendar, Lock, CheckCircle2, X } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ratingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HOSTELS } from '../../data/menuData';
import { canRateMeal } from '../../utils/timeUtils';
import api from '../../services/api';
import { DailyRatingGraph } from './DailyRatingGraph';

const MEAL_CONFIG = [
  { id: 'breakfast', title: 'Breakfast', icon: <Coffee size={18} />, accent: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  { id: 'lunch',     title: 'Lunch',     icon: <Sun size={18} />,    accent: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  { id: 'snacks',    title: 'Snacks',    icon: <Cookie size={18} />, accent: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
  { id: 'dinner',    title: 'Dinner',    icon: <Moon size={18} />,   accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
];

const STAR_EMOJIS = ['😣', '😕', '🙂', '😊', '🤩'];
const STAR_LABELS = ['Worst', 'Bad', 'Average', 'Good', 'Very Good'];

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1f2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: '"DM Mono", monospace',
    }}>
      {payload[0].payload.meal}: <strong style={{ color: '#a5b4fc' }}>{payload[0].value.toFixed(1)}</strong>
    </div>
  );
};

export const DayDetail = ({ dayMenu, onClose, onRequireLogin, hostelId = 'bh1', pendingRating, onPendingRatingHandled }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [mealStats, setMealStats] = useState({});
  const [submittingKey, setSubmittingKey] = useState('');
  const [hoveredStar, setHoveredStar] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [histLoading, setHistLoading] = useState(false);
  const [confirmRating, setConfirmRating] = useState(null);
  // KEY FIX: track rated meals as "day-mealType" with rating value e.g. { "Monday-breakfast": 3 }
  const [ratedMeals, setRatedMeals] = useState({});
  const [loadingMyRatings, setLoadingMyRatings] = useState(false);

  const today = getTodayString();

  const isOwnHostel = user && user.hostelId === hostelId;
  const currentHostel = useMemo(() => HOSTELS.find(h => h.id === hostelId), [hostelId]);

  // Calculate the date for the given day name
  const getDayDate = (dayName) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIndex = days.indexOf(dayName);
  if (dayIndex === -1) return null;

  const now = new Date();
  const todayJS = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = todayJS === 0 ? 6 : todayJS - 1;

  // Get this week's Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Get target day from this Monday
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayIndex);

  return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
};

  // Fetch meal stats for this day
  useEffect(() => {
    if (!dayMenu?.day) return;
    
    const fetchMealStats = async () => {
      try {
        const dayDate = getDayDate(dayMenu.day);
        console.log('fetchMealStats dayDate:', dayDate);
        if (!dayDate) return;
        
        const response = await api.get(`/ratings/weekly-averages?date=${dayDate}`);
        if (response.data?.meals) {
          const statsMap = {};
          response.data.meals.forEach((meal) => {
            statsMap[meal.mealType] = {
              avg: meal.avgRating || 0,
              count: meal.totalRatings || 0
            };
          });
          setMealStats(statsMap);
        }
      } catch (error) {
        console.error('Failed to fetch meal stats:', error);
      }
    };
    
    fetchMealStats();
  }, [dayMenu?.day]);

  // Fetch user's existing ratings for this day
  useEffect(() => {
    if (!user || !dayMenu?.day) return;
    
    const fetchMyRatings = async () => {
      setLoadingMyRatings(true);
      try {
        const response = await api.get(`/ratings/my-ratings?day=${dayMenu.day}`);
        const ratingsMap = {};
        response.data.forEach((rating) => {
          const key = `${rating.day}-${rating.mealType}`;
          ratingsMap[key] = rating.rating;
        });
        setRatedMeals(ratingsMap);
      } catch (error) {
        console.error('Failed to fetch user ratings:', error);
      } finally {
        setLoadingMyRatings(false);
      }
    };
    
    fetchMyRatings();
  }, [user, dayMenu?.day]);

  useEffect(() => {
    if (!socket) return undefined;
    const handleRatingUpdate = (data) => {
      if (data.hostel === hostelId && data.day === dayMenu.day) {
        setMealStats((prev) => ({
          ...prev,
          [data.mealType]: { avg: parseFloat(data.avgRating), count: data.count },
        }));
      }
    };
    socket.on('ratingUpdated', handleRatingUpdate);
    return () => socket.off('ratingUpdated', handleRatingUpdate);
  }, [hostelId, dayMenu.day, socket]);

  const handleRate = async (mealType, rating, itemName) => {
    if (!user) { onRequireLogin?.({ mealType, rating, itemName }); return; }
    if (!isOwnHostel) {
      alert(`You are logged in to ${user.hostel}. You can only rate food in your own hostel.`);
      return;
    }
    if (!canRateMeal(dayMenu.day, mealType)) {
      alert('This meal cannot be rated anymore.');
      return;
    }
    // KEY FIX: check rated using "day-mealType" key
    const ratedKey = `${dayMenu.day}-${mealType}`;
    if (ratedMeals[ratedKey]) {
      alert('You have already rated this meal for this day.');
      return;
    }
    setConfirmRating({ mealType, rating, itemName });
  };

  const handleConfirmRating = async () => {
    if (!confirmRating) return;
    const { mealType, rating, itemName } = confirmRating;
    const requestKey = `${mealType}-${rating}`;
    try {
      setSubmittingKey(requestKey);
      const response = await ratingService.submitRating({ day: dayMenu.day, mealType, itemName, rating });
      if (response?.stats) {
        setMealStats((prev) => ({
          ...prev,
          [mealType]: { avg: parseFloat(response.stats.avgRating), count: response.stats.count },
        }));
      }
      // KEY FIX: mark this specific day+mealType as rated with the rating value
      const ratedKey = `${dayMenu.day}-${mealType}`;
      setRatedMeals((prev) => ({ ...prev, [ratedKey]: rating }));
      setConfirmRating(null);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Rating failed');
    } finally {
      setSubmittingKey('');
    }
  };

  useEffect(() => {
    if (!user || !pendingRating) return;
    if (!canRateMeal(dayMenu.day, pendingRating.mealType)) {
      alert('This meal cannot be rated anymore.');
      onPendingRatingHandled?.();
      return;
    }
    // KEY FIX: check pending rating also with day+mealType key
    const ratedKey = `${dayMenu.day}-${pendingRating.mealType}`;
    if (ratedMeals[ratedKey]) {
      alert('You have already rated this meal for this day.');
      onPendingRatingHandled?.();
      return;
    }
    setConfirmRating(pendingRating);
    onPendingRatingHandled?.();
  }, [pendingRating, user, dayMenu.day, ratedMeals]);

  useEffect(() => {
    if (!selectedDate) { setHistoricalData(null); return; }
    const fetchHistorical = async () => {
      setHistLoading(true);
      try {
        const res = await api.get(`/ratings/weekly-averages?date=${selectedDate}`);
        setHistoricalData(res.data);
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
      } finally {
        setHistLoading(false);
      }
    };
    fetchHistorical();
  }, [selectedDate]);

  const chartData = useMemo(() => {
  return MEAL_CONFIG
    .filter((s) => canRateMeal(dayMenu.day, s.id)) // ← only unlocked meals
    .map((s) => ({
      meal: s.title,
      rating: mealStats[s.id]?.avg || 0,
      accent: s.accent,
    }));
}, [mealStats, dayMenu.day]);

  const MEAL_EMOJIS = { breakfast: '☀️', lunch: '🍱', snacks: '🍿', dinner: '🌙' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{ position: 'fixed', inset: 0, zIndex: 70, overflowY: 'auto', background: '#0d1017' }}
      className="no-scrollbar"
    >
      {/* Back button */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', left: '16px', top: '16px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '6px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          padding: '8px 14px',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
        }}
      >
        <ChevronLeft size={16} />
        Back
      </motion.button>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 16px 40px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Daily Breakdown
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {dayMenu.day}
          </h2>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif' }}>
            Rate each meal and track quality in real time.
          </p>
        </div>

        {/* Historical Date Picker */}
        <div style={{
          marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
          border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#818cf8" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8', fontFamily: '"DM Mono", monospace' }}>
              View past ratings
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#4b5563', cursor: 'pointer',
                  fontSize: '11px', padding: '5px 10px', fontFamily: '"DM Mono", monospace',
                }}
              >
                Clear
              </button>
            )}
            <input
              type="date"
              value={selectedDate || ''}
              max={today}
              min={(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })()}
              onChange={e => setSelectedDate(e.target.value || null)}
              style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '8px', color: '#818cf8', cursor: 'pointer',
                fontSize: '12px', padding: '6px 10px', fontFamily: '"DM Mono", monospace',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Historical Data */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: '24px', padding: '20px',
                borderRadius: '14px', border: '1px solid rgba(99,102,241,0.25)',
                background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', marginBottom: '16px' }}>
                📅 {formatDate(selectedDate)} — Meal Ratings
              </p>

              {histLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : historicalData?.meals ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {historicalData.meals.map((meal, idx) => {
                    const hasData = meal.avgRating !== null;
                    const quality = hasData ?
                      meal.avgRating >= 4.5 ? 'Very Good' :
                      meal.avgRating >= 3.5 ? 'Good' :
                      meal.avgRating >= 2.5 ? 'Average' : 'Bad'
                      : 'No Data';
                    const colorMap = { 'Very Good': '#34d399', 'Good': '#60a5fa', 'Average': '#fbbf24', 'Bad': '#f87171', 'No Data': '#374151' };
                    const color = colorMap[quality];

                    return (
                      <div key={idx} style={{
                        padding: '14px 10px', borderRadius: '10px', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <p style={{ fontSize: '18px', marginBottom: '4px' }}>{MEAL_EMOJIS[meal.mealType]}</p>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {meal.mealType}
                        </p>
                        {hasData ? (
                          <>
                            <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                              {meal.avgRating.toFixed(1)}
                            </p>
                            <p style={{ fontSize: '9px', color: '#374151', fontFamily: '"DM Mono", monospace', marginBottom: '8px' }}>/5</p>
                            <div style={{
                              padding: '3px 6px', borderRadius: '5px',
                              background: `${color}18`, border: `1px solid ${color}40`,
                              fontSize: '9px', fontWeight: 700, color,
                              fontFamily: '"DM Mono", monospace', textTransform: 'uppercase',
                            }}>
                              {quality}
                            </div>
                            <p style={{ fontSize: '9px', color: '#374151', fontFamily: '"DM Mono", monospace', marginTop: '4px' }}>
                              {meal.totalRatings} ratings
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '11px', color: '#374151', fontFamily: '"DM Mono", monospace' }}>No data</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', fontFamily: '"DM Mono", monospace' }}>
                  No ratings found for this date
                </p>
              )}

              {historicalData?.overallAvg && (
                <div style={{
                  marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '12px', color: '#818cf8', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                    Overall Day Average
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif' }}>
                    {historicalData.overallAvg.toFixed(1)}<span style={{ fontSize: '11px', color: '#374151' }}>/5</span>
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Meal Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MEAL_CONFIG.map((section, idx) => {
            const stats = mealStats[section.id] || { avg: 0, count: 0 };
            const roundedAvg = Math.round(stats.avg);
            const hovered = hoveredStar[section.id] ?? 0;
            // KEY FIX: check rated with day+mealType key
            const ratedKey = `${dayMenu.day}-${section.id}`;
            const userRating = ratedMeals[ratedKey] || 0;
            const alreadyRated = userRating > 0;
            // Show user's rating if already rated, otherwise show hover/avg
            const activeStar = alreadyRated ? userRating : (hovered || roundedAvg);

            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ height: '2px', background: section.accent, opacity: 0.6 }} />

                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '9px',
                        background: section.bg, border: `1px solid ${section.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: section.accent, flexShrink: 0,
                      }}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}>
                          {section.title}
                        </h3>
                        <p style={{ fontSize: '10px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em', marginTop: '2px' }}>
                          {stats.count ? `${stats.avg.toFixed(1)} / 5 · ${stats.count} ratings` : 'No ratings yet'}
                        </p>
                      </div>
                    </div>

                    {stats.count > 0 && (
                      <div style={{
                        padding: '4px 10px', borderRadius: '20px',
                        background: section.bg, border: `1px solid ${section.border}`,
                        fontSize: '13px', fontWeight: 700,
                        color: section.accent, fontFamily: '"DM Mono", monospace',
                      }}>
                        {stats.avg.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.65, fontFamily: '"DM Sans", sans-serif', marginBottom: '16px' }}>
                    {dayMenu.menu[section.id]}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                    {!isOwnHostel && user && (
                      <div style={{
                        marginBottom: '12px', padding: '10px 12px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <Lock size={14} color="#fca5a5" />
                        <span style={{ fontSize: '11px', color: '#fca5a5', fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>
                          View only — Login to {currentHostel?.name} to rate
                        </span>
                      </div>
                    )}

                    {/* KEY FIX: show "already rated" badge for this specific day+meal */}
                    {alreadyRated && (
                      <div style={{
                        marginBottom: '12px', padding: '10px 12px', borderRadius: '8px',
                        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <CheckCircle2 size={14} color="#34d399" />
                        <span style={{ fontSize: '11px', color: '#34d399', fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>
                          You've rated this meal for {dayMenu.day}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const filled = s <= activeStar;
                          // KEY FIX: also disable if already rated this day+meal
                          const canRate = isOwnHostel && canRateMeal(dayMenu.day, section.id) && !alreadyRated;
                          const isDisabled = !canRate || submittingKey === `${section.id}-${s}`;
                          return (
                            <button
                              key={`${section.id}-${s}`}
                              onClick={() => handleRate(section.id, s, section.title)}
                              onMouseEnter={() => canRate ? setHoveredStar((p) => ({ ...p, [section.id]: s })) : null}
                              onMouseLeave={() => canRate ? setHoveredStar((p) => ({ ...p, [section.id]: 0 })) : null}
                              disabled={isDisabled}
                              style={{
                                background: 'none', border: 'none', cursor: canRate ? 'pointer' : 'not-allowed', padding: '2px',
                                color: filled ? section.accent : '#2d3748',
                                transition: 'all 0.15s ease',
                                transform: !canRate ? 'scale(1)' : hovered >= s ? 'scale(1.2)' : 'scale(1)',
                                opacity: isDisabled ? 0.3 : 1,
                              }}
                            >
                              <Star size={22} fill={filled ? 'currentColor' : 'transparent'} strokeWidth={1.5} />
                            </button>
                          );
                        })}
                      </div>

                      {activeStar > 0 && isOwnHostel && canRateMeal(dayMenu.day, section.id) && !alreadyRated && (
                        <motion.div
                          key={activeStar}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span style={{ fontSize: '22px' }}>{STAR_EMOJIS[activeStar - 1]}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: section.accent, fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
                            {STAR_LABELS[activeStar - 1]}
                          </span>
                        </motion.div>
                      )}

                      {(activeStar === 0 || !isOwnHostel || !canRateMeal(dayMenu.day, section.id) || alreadyRated) && (
                        <span style={{ fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                          {!user ? 'Sign in to rate' : !isOwnHostel ? 'View only' : alreadyRated ? 'Rated ✓' : !canRateMeal(dayMenu.day, section.id) ? 'Locked' : 'Tap to rate'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Today's Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            marginTop: '16px', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ padding: '20px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
              {dayMenu.day} — Today's Rating Overview
            </h3>
            <p style={{ fontSize: '9px', color: '#4b5563', fontFamily: '"DM Mono", monospace', marginTop: '2px', marginBottom: '16px' }}>
              Average scores across all meals today
            </p>
          </div>

          <div style={{ height: '220px', padding: '8px 8px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="meal"
                  tick={{ fill: '#4b5563', fontSize: 11, fontFamily: '"DM Mono", monospace' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fill: '#4b5563', fontSize: 11, fontFamily: '"DM Mono", monospace' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#818cf8', r: 5, strokeWidth: 1 }}
                  activeDot={{ fill: '#6366f1', r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
       <DailyRatingGraph dayName={dayMenu.day} />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setConfirmRating(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '380px',
                width: '90vw',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <p style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Confirm Your Rating
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
                <span style={{ fontSize: '48px' }}>
                  {STAR_EMOJIS[confirmRating.rating - 1]}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                    {STAR_LABELS[confirmRating.rating - 1]}
                  </p>
                  <p style={{ fontSize: '12px', color: '#4b5563', fontFamily: '"DM Mono", monospace', marginTop: '4px' }}>
                    {confirmRating.rating}/5 stars
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6, marginBottom: '28px' }}>
                Are you sure you want to submit this rating? Once submitted, you won't be able to edit it.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setConfirmRating(null)}
                  style={{
                    flex: 1,
                    padding: '12px 16px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#cbd5e1', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRating}
                  disabled={submittingKey !== ''}
                  style={{
                    flex: 1,
                    padding: '12px 16px', borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff', cursor: submittingKey ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    opacity: submittingKey ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => !submittingKey && (e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {submittingKey ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Coffee, Sun, Moon, Cookie, Star, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ratingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HOSTELS } from '../../data/menuData';
import { canRateMeal } from '../../utils/timeUtils';
import api from '../../services/api';
import { DailyRatingGraph } from './DailyRatingGraph';

const MEAL_CONFIG = [
  { id: 'breakfast', title: 'Breakfast', icon: <Coffee size={18} />, accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'lunch',     title: 'Lunch',     icon: <Sun size={18} />,    accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'snacks',    title: 'Snacks',    icon: <Cookie size={18} />, accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'dinner',    title: 'Dinner',    icon: <Moon size={18} />,   accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
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
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#0f172a',
    }}>
      {payload[0].payload.meal}: <strong style={{ color: '#2563eb' }}>{payload[0].value.toFixed(1)}</strong>
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
  const [ratedMeals, setRatedMeals] = useState({});
  const [loadingMyRatings, setLoadingMyRatings] = useState(false);

  const today = getTodayString();
  const isOwnHostel = user && user.hostelId === hostelId;
  const currentHostel = useMemo(() => HOSTELS.find(h => h.id === hostelId), [hostelId]);

  const getDayDate = (dayName) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = days.indexOf(dayName);
    if (dayIndex === -1) return null;
    const now = new Date();
    const todayJS = now.getDay();
    const mondayOffset = todayJS === 0 ? 6 : todayJS - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!dayMenu?.day) return;
    const fetchMealStats = async () => {
      try {
        const dayDate = getDayDate(dayMenu.day);
        if (!dayDate) return;
        const response = await api.get(`/ratings/weekly-averages?date=${dayDate}`);
        if (response.data?.meals) {
          const statsMap = {};
          response.data.meals.forEach((meal) => {
            statsMap[meal.mealType] = { avg: meal.avgRating || 0, count: meal.totalRatings || 0 };
          });
          setMealStats(statsMap);
        }
      } catch (error) {
        console.error('Failed to fetch meal stats:', error);
      }
    };
    fetchMealStats();
  }, [dayMenu?.day]);

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
      .filter((s) => canRateMeal(dayMenu.day, s.id))
      .map((s) => ({
        meal: s.title,
        rating: mealStats[s.id]?.avg || 0,
        accent: s.accent,
      }));
  }, [mealStats, dayMenu.day]);

  const MEAL_EMOJIS = { breakfast: '☀️', lunch: '🍱', snacks: '🍿', dinner: '🌙' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 70, overflowY: 'auto', background: '#f8fafc' }}
      className="no-scrollbar"
    >
      {/* Back button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', left: '16px', top: '16px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '6px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '8px 14px',
          color: '#0f172a',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 16px 40px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Daily Breakdown
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {dayMenu.day}
          </h2>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
            Rate each meal and track quality in real time.
          </p>
        </div>

        {/* Historical Date Picker */}
        <div style={{
          marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
          border: '1px solid #e2e8f0', background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#2563eb" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
              View past ratings
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  background: 'none', border: '1px solid #e2e8f0',
                  borderRadius: '8px', color: '#64748b', cursor: 'pointer',
                  fontSize: '11px', padding: '5px 10px',
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
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '8px', color: '#0f172a', cursor: 'pointer',
                fontSize: '12px', padding: '6px 10px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Historical Data */}
        {selectedDate && (
          <div style={{
            marginBottom: '24px', padding: '20px',
            borderRadius: '12px', border: '1px solid #e2e8f0',
            background: '#ffffff',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              📅 {formatDate(selectedDate)} — Meal Ratings
            </p>

            {histLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
                  const colorMap = { 'Very Good': '#16a34a', 'Good': '#2563eb', 'Average': '#d97706', 'Bad': '#dc2626', 'No Data': '#94a3b8' };
                  const color = colorMap[quality];

                  return (
                    <div key={idx} style={{
                      padding: '14px 10px', borderRadius: '10px', textAlign: 'center',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                    }}>
                      <p style={{ fontSize: '18px', marginBottom: '4px' }}>{MEAL_EMOJIS[meal.mealType]}</p>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {meal.mealType}
                      </p>
                      {hasData ? (
                        <>
                          <p style={{ fontSize: '22px', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>
                            {meal.avgRating.toFixed(1)}
                          </p>
                          <p style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '8px' }}>/5</p>
                          <div style={{
                            padding: '3px 6px', borderRadius: '5px',
                            background: `${color}18`, border: `1px solid ${color}40`,
                            fontSize: '9px', fontWeight: 700, color,
                            textTransform: 'uppercase',
                          }}>
                            {quality}
                          </div>
                        </>
                      ) : (
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>No data</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                No ratings found for this date
              </p>
            )}

            {historicalData?.overallAvg && (
              <div style={{
                marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
                background: '#eff6ff', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>
                  Overall Day Average
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
                  {historicalData.overallAvg.toFixed(1)}<span style={{ fontSize: '11px', color: '#94a3b8' }}>/5</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Meal Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MEAL_CONFIG.map((section) => {
            const stats = mealStats[section.id] || { avg: 0, count: 0 };
            const roundedAvg = Math.round(stats.avg);
            const hovered = hoveredStar[section.id] ?? 0;
            const ratedKey = `${dayMenu.day}-${section.id}`;
            const userRating = ratedMeals[ratedKey] || 0;
            const alreadyRated = userRating > 0;
            const activeStar = alreadyRated ? userRating : (hovered || roundedAvg);

            return (
              <div
                key={section.id}
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                {/* Top accent line — blue only */}
                <div style={{ height: '3px', background: '#2563eb' }} />

                <div style={{ padding: '18px 20px' }}>
                  {/* Meal header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '9px',
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#2563eb', flexShrink: 0,
                      }}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                          {section.title}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        </p>
                      </div>
                    </div>

                    {stats.count > 0 && (
                      <div style={{
                        padding: '4px 10px', borderRadius: '20px',
                        background: '#fff7ed', border: '1px solid #fed7aa',
                        fontSize: '13px', fontWeight: 700, color: '#f97316',
                      }}>
                        {stats.avg.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Menu text */}
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65, marginBottom: '16px' }}>
                    {dayMenu.menu[section.id]}
                  </p>

                  {/* Rating row */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    {!isOwnHostel && user && (
                      <div style={{
                        marginBottom: '12px', padding: '10px 12px', borderRadius: '8px',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <Lock size={14} color="#dc2626" />
                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                          View only — Login to {currentHostel?.name} to rate
                        </span>
                      </div>
                    )}

                    {alreadyRated && (
                      <div style={{
                        marginBottom: '12px', padding: '10px 12px', borderRadius: '8px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                          You've rated this meal for {dayMenu.day}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const filled = s <= activeStar;
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
                                background: 'none', border: 'none',
                                cursor: canRate ? 'pointer' : 'not-allowed', padding: '2px',
                                color: filled ? '#f97316' : '#e2e8f0',
                                opacity: isDisabled ? 0.4 : 1,
                              }}
                            >
                              <Star size={22} fill={filled ? 'currentColor' : 'transparent'} strokeWidth={1.5} />
                            </button>
                          );
                        })}
                      </div>

                      {activeStar > 0 && isOwnHostel && canRateMeal(dayMenu.day, section.id) && !alreadyRated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '20px' }}>{STAR_EMOJIS[activeStar - 1]}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f97316' }}>
                            {STAR_LABELS[activeStar - 1]}
                          </span>
                        </div>
                      )}

                      {(activeStar === 0 || !isOwnHostel || !canRateMeal(dayMenu.day, section.id) || alreadyRated) && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {!user ? 'Sign in to rate' : !isOwnHostel ? 'View only' : alreadyRated ? 'Rated ✓' : !canRateMeal(dayMenu.day, section.id) ? 'Locked' : 'Tap to rate'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Chart */}
        <div style={{
          marginTop: '16px', borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              {dayMenu.day} — Today's Rating Overview
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Average scores across all meals today
            </p>
          </div>

          <div style={{ height: '220px', padding: '8px 8px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="meal"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 5, strokeWidth: 0 }}
                  activeDot={{ fill: '#2563eb', r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DailyRatingGraph dayName={dayMenu.day} />
      </div>

      {/* Confirmation Modal */}
      {confirmRating && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setConfirmRating(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '380px',
              width: '90vw',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Confirm Your Rating
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px' }}>{STAR_EMOJIS[confirmRating.rating - 1]}</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {STAR_LABELS[confirmRating.rating - 1]}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {confirmRating.rating}/5 stars
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
              Are you sure you want to submit this rating? Once submitted, you won't be able to edit it.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmRating(null)}
                style={{
                  flex: 1,
                  padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600,
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
                  background: '#2563eb',
                  color: '#ffffff', cursor: submittingKey ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: submittingKey ? 0.6 : 1,
                }}
              >
                {submittingKey ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
          </div>
        </div>
      )}
    </div>
  );
};

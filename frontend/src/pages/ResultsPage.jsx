import React, { useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext } from '../context/AuthContext';
import WeeklyGraph from '../components/results/WeeklyGraph';
import UserPoll from '../components/results/UserPoll';
import AdminPolls from '../components/results/AdminPolls';
import api, { ratingService } from '../services/api';
import { BarChart2, Vote, History, Lock, Loader2, Calendar, ChevronDown } from 'lucide-react';

const getQualityColor = (quality) => {
  const map = {
    'Very Good': '#34d399',
    'Good': '#60a5fa',
    'Average': '#fbbf24',
    'Bad': '#f87171',
    'No Data': '#374151',
  };
  return map[quality] || '#374151';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const [weeklyGraphData, setWeeklyGraphData] = useState(null);
  const [overviewData, setOverviewData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [userPoll, setUserPoll] = useState(null);
  const [adminPolls, setAdminPolls] = useState([]);
  const [expiredPolls, setExpiredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [votingPollId, setVotingPollId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [graphRes, overviewRes, pollsRes, expiredRes] = await Promise.all([
        api.get('/ratings/weekly-graph'),
        api.get('/ratings/weekly-averages'),
        api.get('/poll/current'),
        api.get('/poll/expired'),
      ]);
      setWeeklyGraphData(graphRes.data);
      setOverviewData(overviewRes.data.data || []);
      setUserPoll(pollsRes.data.userPoll);
      setAdminPolls(pollsRes.data.adminPolls);
      setExpiredPolls(expiredRes.data);
    } catch (err) {
      setError('Failed to load results. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDateData = async (date) => {
    setDateLoading(true);
    try {
      const res = await api.get(`/ratings/weekly-averages?date=${date}`);
      setSelectedDayData(res.data);
    } catch (err) {
      console.error('Failed to fetch date data:', err);
    } finally {
      setDateLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (selectedDate) fetchDateData(selectedDate);
    else setSelectedDayData(null);
  }, [selectedDate]);

  const handlePollVote = async (pollId, optionIndex) => {
    try {
      setVotingPollId(pollId);
      await api.post('/poll/vote', { pollId, optionIndex });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vote. Please try again.');
    } finally {
      setVotingPollId(null);
    }
  };

  const MEAL_EMOJIS = { breakfast: '☀️', lunch: '🍱', snacks: '🍿', dinner: '🌙' };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '24px' }}>
        <div style={{
          borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
          padding: '48px 32px', textAlign: 'center', maxWidth: '400px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 16px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={20} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', marginBottom: '8px' }}>
            Results & Polls
          </h2>
          <p style={{ fontSize: '13px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
            Please log in to view results and participate in polls.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '14px' }}>
        <Loader2 size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Loading results...
        </p>
      </div>
    );
  }

  const today = getTodayString();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          marginBottom: '14px', padding: '4px 14px', borderRadius: '20px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
          fontSize: '10px', fontWeight: 700, color: '#818cf8',
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <BarChart2 size={11} /> Results & Analytics
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, color: '#f1f5f9',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '10px',
        }}>
          Hostel Mess Results
        </h1>
        <p style={{ fontSize: '13px', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>
          Hostel: <span style={{ color: '#818cf8', fontWeight: 700 }}>{user.hostel}</span>
        </p>
      </motion.div>

      {error && (
        <div style={{
          marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          fontSize: '13px', color: '#fca5a5', fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 30 Day Overview */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="#818cf8" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
              Last 30 Days
            </h2>
          </div>

          {/* Date picker */}
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

        {/* Banner */}
        <div style={{
          marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
          fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Calendar size={12} color="#6366f1" />
          📅 Showing last 30 days — data older than 30 days is removed automatically
        </div>

        {/* Selected date detail */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: '20px', padding: '20px',
                borderRadius: '14px', border: '1px solid rgba(99,102,241,0.25)',
                background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', marginBottom: '16px' }}>
                📅 {formatDate(selectedDate)} — Meal Breakdown
              </p>

              {dateLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Loader2 size={20} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : selectedDayData && selectedDayData.meals ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  {selectedDayData.meals.map((meal, idx) => {
                    const hasData = meal.avgRating !== null;
                    const quality = hasData ?
                      meal.avgRating >= 4.5 ? 'Very Good' :
                      meal.avgRating >= 3.5 ? 'Good' :
                      meal.avgRating >= 2.5 ? 'Average' : 'Bad'
                      : 'No Data';
                    const color = getQualityColor(quality);

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

              {/* Overall average */}
              {selectedDayData?.overallAvg && (
                <div style={{
                  marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '12px', color: '#818cf8', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                    Overall Day Average
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif' }}>
                    {selectedDayData.overallAvg.toFixed(1)}<span style={{ fontSize: '11px', color: '#374151' }}>/5</span>
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 30 day cards */}
        {/* 30 day cards - REMOVED */}
        {false && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {overviewData.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1', padding: '32px', textAlign: 'center',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
                fontSize: '12px', color: '#374151', fontFamily: '"DM Mono", monospace',
              }}>
                No rating data in the last 30 days
              </div>
            ) : (
              overviewData.map((day, idx) => {
                const isToday = day.date === today;
                const color = getQualityColor(day.quality);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedDate(day.date)}
                    style={{
                      padding: '14px 10px', borderRadius: '12px', textAlign: 'center',
                      border: `1px solid ${isToday ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      background: isToday
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.1) 100%)'
                        : 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isToday ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {isToday && (
                      <div style={{
                        marginBottom: '6px', padding: '2px 8px', borderRadius: '20px',
                        background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                        fontSize: '8px', fontWeight: 700, color: '#818cf8',
                        fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em',
                        display: 'inline-block',
                      }}>
                        TODAY
                      </div>
                    )}
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {day.day.slice(0, 3)}
                    </p>
                    <p style={{ fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace', marginBottom: '8px' }}>
                      {formatDate(day.date).split(',')[0]}
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', lineHeight: 1, marginBottom: '2px' }}>
                      {day.avgRating.toFixed(1)}
                    </p>
                    <p style={{ fontSize: '9px', color: '#374151', fontFamily: '"DM Mono", monospace', marginBottom: '8px' }}>/5</p>
                    <div style={{
                      padding: '3px 6px', borderRadius: '5px',
                      background: `${color}18`, border: `1px solid ${color}40`,
                      fontSize: '9px', fontWeight: 700, color,
                      fontFamily: '"DM Mono", monospace', textTransform: 'uppercase',
                    }}>
                      {day.quality}
                    </div>
                    <p style={{ fontSize: '9px', color: '#374151', fontFamily: '"DM Mono", monospace', marginTop: '4px' }}>
                      {day.totalRatings} ratings
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </motion.section>

      {/* Weekly Graph */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: '20px' }}>
        <WeeklyGraph data={weeklyGraphData} />
      </motion.section>

      {/* Active Polls */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Vote size={15} color="#818cf8" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
            Active Polls
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          <UserPoll poll={userPoll} onVote={handlePollVote} isLoading={votingPollId === userPoll?._id} />
          <AdminPolls polls={adminPolls} onVote={handlePollVote} isLoading={votingPollId !== null} />
        </div>
      </motion.section>

      {/* Previous Poll Results */}
      {expiredPolls.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <History size={15} color="#818cf8" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
              Previous Poll Results
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {expiredPolls.map((poll, idx) => (
              <div key={idx} style={{
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
                padding: '18px', transition: 'border-color 0.15s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.4, flex: 1 }}>
                    {poll.question}
                  </h4>
                  <span style={{
                    flexShrink: 0, padding: '2px 8px', borderRadius: '5px',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '9px', fontWeight: 700, color: '#818cf8',
                    fontFamily: '"DM Mono", monospace', whiteSpace: 'nowrap',
                  }}>
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  {poll.results.map((result, ridx) => (
                    <div key={ridx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', fontFamily: '"DM Sans", sans-serif' }}>
                          {result.text}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace' }}>
                          {result.percentage}%
                        </span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                          width: `${result.percentage}%`,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <p style={{ marginTop: '3px', fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace' }}>
                        {result.votes} votes
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
                  {poll.totalVotes} total votes
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default ResultsPage;
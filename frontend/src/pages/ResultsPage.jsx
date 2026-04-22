import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import WeeklyGraph from '../components/results/WeeklyGraph';
import UserPoll from '../components/results/UserPoll';
import AdminPolls from '../components/results/AdminPolls';
import api from '../services/api';
import { BarChart2, Vote, History, Lock, Loader2, Calendar } from 'lucide-react';

const getQualityColor = (quality) => {
  const map = {
    'Very Good': '#16a34a',
    'Good': '#2563eb',
    'Average': '#d97706',
    'Bad': '#dc2626',
    'No Data': '#94a3b8',
  };
  return map[quality] || '#94a3b8';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const MEAL_EMOJIS = { breakfast: '☀️', lunch: '🍱', snacks: '🍿', dinner: '🌙' };

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const [weeklyGraphData, setWeeklyGraphData] = useState(null);
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
      const [graphRes, pollsRes, expiredRes] = await Promise.all([
        api.get('/ratings/weekly-graph'),
        api.get('/poll/current'),
        api.get('/poll/expired'),
      ]);
      setWeeklyGraphData(graphRes.data);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center mx-auto mb-4">
            <Lock size={20} color="#2563eb" />
          </div>
          <h2 className="text-lg font-extrabold text-[#0f172a] mb-2">Results & Polls</h2>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Please log in to view results and participate in polls.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 size={28} color="#2563eb" className="animate-spin" />
        <p className="text-xs text-[#64748b] tracking-widest uppercase">Loading results...</p>
      </div>
    );
  }

  const today = getTodayString();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-16">

      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[10px] font-bold tracking-widest uppercase">
          <BarChart2 size={11} /> Results & Analytics
        </div>
        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight mb-2">
          Hostel Mess Results
        </h1>
        <p className="text-sm text-[#64748b]">
          Hostel: <span className="text-[#2563eb] font-bold">{user.hostel}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-sm text-[#dc2626] font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Date Picker Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Calendar size={15} color="#2563eb" />
            <h2 className="text-sm font-bold text-[#0f172a]">Last 30 Days</h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="bg-white border border-[#e2e8f0] rounded-lg text-[#64748b] text-xs px-3 py-1.5 cursor-pointer"
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
              className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg text-[#2563eb] text-xs px-3 py-1.5 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#64748b] flex items-center gap-2">
          <Calendar size={12} color="#2563eb" />
          📅 Showing last 30 days — data older than 30 days is removed automatically
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="mb-5 p-5 rounded-xl border border-[#bfdbfe] bg-white">
            <p className="text-sm font-bold text-[#0f172a] mb-4">
              📅 {formatDate(selectedDate)} — Meal Breakdown
            </p>

            {dateLoading ? (
              <div className="flex justify-center py-5">
                <Loader2 size={20} color="#2563eb" className="animate-spin" />
              </div>
            ) : selectedDayData?.meals ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {selectedDayData.meals.map((meal, idx) => {
                    const hasData = meal.avgRating !== null;
                    const quality = hasData ?
                      meal.avgRating >= 4.5 ? 'Very Good' :
                      meal.avgRating >= 3.5 ? 'Good' :
                      meal.avgRating >= 2.5 ? 'Average' : 'Bad'
                      : 'No Data';
                    const color = getQualityColor(quality);
                    return (
                      <div key={idx} className="p-3 rounded-xl text-center border border-[#e2e8f0] bg-[#f8fafc]">
                        <p className="text-lg mb-1">{MEAL_EMOJIS[meal.mealType]}</p>
                        <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider mb-2">
                          {meal.mealType}
                        </p>
                        {hasData ? (
                          <>
                            <p className="text-xl font-black text-[#f97316] leading-none mb-0.5">
                              {meal.avgRating.toFixed(1)}
                            </p>
                            <p className="text-[9px] text-[#94a3b8] mb-2">/5</p>
                            <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase inline-block"
                              style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                              {quality}
                            </div>
                            <p className="text-[9px] text-[#94a3b8] mt-1">{meal.totalRatings} ratings</p>
                          </>
                        ) : (
                          <p className="text-[11px] text-[#94a3b8]">No data</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedDayData?.overallAvg && (
                  <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2563eb]">Overall Day Average</span>
                    <span className="text-lg font-black text-[#f97316]">
                      {selectedDayData.overallAvg.toFixed(1)}
                      <span className="text-xs text-[#94a3b8] font-normal">/5</span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-[#94a3b8] text-xs">No ratings found for this date</p>
            )}
          </div>
        )}
      </section>

      {/* Weekly Graph */}
      <section className="mb-5">
        <WeeklyGraph data={weeklyGraphData} />
      </section>

      {/* Active Polls */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0]">
          <Vote size={15} color="#2563eb" />
          <h2 className="text-sm font-bold text-[#0f172a]">Active Polls</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UserPoll poll={userPoll} onVote={handlePollVote} isLoading={votingPollId === userPoll?._id} />
          <AdminPolls polls={adminPolls} onVote={handlePollVote} isLoading={votingPollId !== null} />
        </div>
      </section>

      {/* Previous Poll Results */}
      {expiredPolls.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0]">
            <History size={15} color="#2563eb" />
            <h2 className="text-sm font-bold text-[#0f172a]">Previous Poll Results</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiredPolls.map((poll, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:border-[#bfdbfe] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h4 className="text-sm font-bold text-[#0f172a] leading-snug flex-1">
                    {poll.question}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded bg-[#eff6ff] border border-[#bfdbfe] text-[9px] font-bold text-[#2563eb] whitespace-nowrap">
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 mb-3">
                  {poll.results.map((result, ridx) => (
                    <div key={ridx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-[#64748b]">{result.text}</span>
                        <span className="text-xs font-bold text-[#2563eb]">{result.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#2563eb]"
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#94a3b8] mt-0.5">{result.votes} votes</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[#f1f5f9] text-center text-[10px] text-[#94a3b8] tracking-wide">
                  {poll.totalVotes} total votes
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResultsPage;
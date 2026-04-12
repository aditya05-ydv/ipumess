import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, Coffee, Sun, Cookie, Moon } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import api from '../../services/api';

const WEEK_TABS = [
  { label: 'This Week',   offset: 0 },
  { label: 'Last Week',   offset: 1 },
  { label: '2 Weeks Ago', offset: 2 },
];

const MEAL_CONFIG = {
  breakfast: { icon: <Coffee size={12} />, color: '#fbbf24', label: 'Breakfast' },
  lunch:     { icon: <Sun size={12} />,    color: '#34d399', label: 'Lunch'     },
  snacks:    { icon: <Cookie size={12} />, color: '#38bdf8', label: 'Snacks'    },
  dinner:    { icon: <Moon size={12} />,   color: '#a78bfa', label: 'Dinner'    },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { mealType, avgRating } = payload[0].payload;
  const config = MEAL_CONFIG[mealType];
  return (
    <div style={{
      background: '#1a1f2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontFamily: '"DM Mono", monospace',
      fontSize: '11px',
    }}>
      <p style={{ color: config?.color, fontWeight: 700, marginBottom: '2px' }}>
        {config?.label}
      </p>
      <p style={{ color: '#e2e8f0' }}>
        {avgRating !== null ? `${avgRating.toFixed(1)} / 5` : 'No data'}
      </p>
    </div>
  );
};

export const DailyRatingGraph = ({ dayName }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dayName) return;
    const fetchData = async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await api.get(`/ratings/day-meal-ratings?day=${dayName}&weekOffset=${activeTab}`);
        setData(res.data);
      } catch (err) {
        console.error('DailyRatingGraph fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dayName, activeTab]);

  const chartData = data?.meals?.map(m => ({
    mealType: m.mealType,
    avgRating: m.avgRating ?? 0,
    fullMark: 5,
  })) ?? [];

  const hasAnyData = data?.hasData && data.meals.some(m => m.avgRating !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        marginTop: '16px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart2 size={15} color="#818cf8" />
        </div>
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: 700,
            color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif',
          }}>
            {dayName} — Meal Ratings
          </h3>
          <p style={{
            fontSize: '10px', color: '#4b5563',
            fontFamily: '"DM Mono", monospace', marginTop: '2px',
          }}>
            Individual average per meal
          </p>
        </div>
      </div>

      {/* Week Tabs */}
      <div style={{
        display: 'flex', gap: '6px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {WEEK_TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: activeTab === idx
                ? '1px solid rgba(99,102,241,0.5)'
                : '1px solid rgba(255,255,255,0.07)',
              background: activeTab === idx
                ? 'rgba(99,102,241,0.15)'
                : 'rgba(255,255,255,0.02)',
              color: activeTab === idx ? '#a5b4fc' : '#4b5563',
              fontSize: '11px', fontWeight: 700,
              fontFamily: '"DM Mono", monospace',
              cursor: 'pointer', transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', height: '180px', gap: '10px',
            }}
          >
            <div style={{
              width: '18px', height: '18px',
              border: '2px solid #6366f1',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>
              Loading...
            </span>
          </motion.div>

        ) : !hasAnyData ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '180px', gap: '10px',
            }}
          >
            <span style={{ fontSize: '28px' }}>📭</span>
            <p style={{
              fontSize: '11px', color: '#374151',
              fontFamily: '"DM Mono", monospace',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              No ratings yet for this week
            </p>
          </motion.div>

        ) : (
          <motion.div
            key={`data-${activeTab}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Radar Chart */}
            <div style={{ height: '220px', padding: '8px 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="mealType"
                    tick={{ fill: '#4b5563', fontSize: 11, fontFamily: '"DM Mono", monospace' }}
                    tickFormatter={(val) => MEAL_CONFIG[val]?.label ?? val}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Radar
                    dataKey="avgRating"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ fill: '#818cf8', r: 4 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Meal stat pills */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px', padding: '4px 16px 16px',
            }}>
              {data.meals.map((meal) => {
                const config = MEAL_CONFIG[meal.mealType];
                const hasData = meal.avgRating !== null;
                return (
                  <div key={meal.mealType} style={{
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 8px', textAlign: 'center',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '4px',
                      color: config?.color, marginBottom: '6px',
                    }}>
                      {config?.icon}
                      <span style={{
                        fontSize: '9px', fontWeight: 700,
                        fontFamily: '"DM Mono", monospace',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}>
                        {config?.label}
                      </span>
                    </div>
                    {hasData ? (
                      <>
                        <p style={{
                          fontSize: '20px', fontWeight: 800,
                          color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', lineHeight: 1,
                        }}>
                          {meal.avgRating.toFixed(1)}
                        </p>
                        <p style={{
                          fontSize: '9px', color: '#374151',
                          fontFamily: '"DM Mono", monospace', marginTop: '2px',
                        }}>
                          {meal.totalRatings} votes
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace' }}>
                        No data
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Date label */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '10px', color: '#374151',
                fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em',
              }}>
                {data.date}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyRatingGraph;
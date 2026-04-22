import { useState, useEffect } from 'react';
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
  breakfast: { icon: <Coffee size={12} />, color: '#f97316', label: 'Breakfast' },
  lunch:     { icon: <Sun size={12} />,    color: '#f97316', label: 'Lunch'     },
  snacks:    { icon: <Cookie size={12} />, color: '#f97316', label: 'Snacks'    },
  dinner:    { icon: <Moon size={12} />,   color: '#f97316', label: 'Dinner'    },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { mealType, avgRating } = payload[0].payload;
  const config = MEAL_CONFIG[mealType];
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '11px',
    }}>
      <p style={{ color: '#2563eb', fontWeight: 700, marginBottom: '2px' }}>
        {config?.label}
      </p>
      <p style={{ color: '#0f172a' }}>
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
    <div style={{
      marginTop: '16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart2 size={15} color="#2563eb" />
        </div>
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: 700, color: '#0f172a',
          }}>
            {dayName} — Meal Ratings
          </h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Individual average per meal
          </p>
        </div>
      </div>

      {/* Week Tabs */}
      <div style={{
        display: 'flex', gap: '6px',
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {WEEK_TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: activeTab === idx ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: activeTab === idx ? '#eff6ff' : '#ffffff',
              color: activeTab === idx ? '#2563eb' : '#64748b',
              fontSize: '11px', fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', height: '180px', gap: '10px',
        }}>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>Loading...</span>
        </div>

      ) : !hasAnyData ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '180px', gap: '8px',
        }}>
          <span style={{ fontSize: '28px' }}>📭</span>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            No ratings yet for this week
          </p>
        </div>

      ) : (
        <div>
          {/* Radar Chart */}
          <div style={{ height: '220px', padding: '8px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="mealType"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => MEAL_CONFIG[val]?.label ?? val}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  dataKey="avgRating"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
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
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '4px',
                    marginBottom: '6px',
                  }}>
                    <span style={{ color: '#2563eb' }}>{config?.icon}</span>
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: '#64748b',
                    }}>
                      {config?.label}
                    </span>
                  </div>
                  {hasData ? (
                    <>
                      <p style={{
                        fontSize: '20px', fontWeight: 800,
                        color: '#f97316', lineHeight: 1,
                      }}>
                        {meal.avgRating.toFixed(1)}
                      </p>
                      <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                        {meal.totalRatings} votes
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
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
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.08em' }}>
              {data.date}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRatingGraph;
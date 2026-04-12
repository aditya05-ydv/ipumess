import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Users, Vote, BarChart2 } from 'lucide-react';

const QUALITY_MAP = {
  'Very Good': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', min: 4.5 },
  'Good':      { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', min: 3.5 },
  'Average':   { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', min: 2.5 },
  'Bad':       { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)', min: 0   },
};

const getQuality = (rating) => {
  if (rating >= 4.5) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  return 'Bad';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const q = getQuality(val);
  const { color } = QUALITY_MAP[q];
  return (
    <div style={{
      background: '#161b27', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '9px', padding: '10px 14px',
      fontFamily: '"DM Mono", monospace', fontSize: '12px',
    }}>
      <p style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: '15px' }}>{val?.toFixed(2)} <span style={{ fontSize: '11px', color: '#4b5563' }}>/ 5</span></p>
      <p style={{ color: '#4b5563', fontSize: '10px', marginTop: '2px' }}>{q}</p>
    </div>
  );
};

const WeeklyGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
        padding: '40px', textAlign: 'center',
        fontSize: '11px', color: '#374151',
        fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        No rating data available yet
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
      background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
      overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      margin: '16px 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart2 size={15} color="#818cf8" />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif' }}>
            Weekly Food Quality Ratings
          </h3>
          <p style={{ fontSize: '10px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em', marginTop: '2px' }}>
            Average scores across the week
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '20px 16px 8px', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#4b5563', fontSize: 11, fontFamily: '"DM Mono", monospace' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fill: '#374151', fontSize: 10, fontFamily: '"DM Mono", monospace' }}
              axisLine={false} tickLine={false}
            />
            <ReferenceLine y={3} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1 }} />
            <Line
              type="monotone" dataKey="avgRating" name="Avg Rating"
              stroke="#6366f1" strokeWidth={2.5}
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#161b27' }}
              activeDot={{ r: 6, fill: '#a5b4fc', stroke: '#161b27', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily cards */}
      <div style={{ padding: '4px 12px 16px' }}>
        <p style={{ fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>
          Daily Summary
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
          {data.map((day, idx) => {
            const q = day.quality || getQuality(day.avgRating);
            const { color, bg, border } = QUALITY_MAP[q] || QUALITY_MAP['Bad'];
            return (
              <div
                key={idx}
                style={{
                  borderRadius: '10px', padding: '12px 10px', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {day.day}
                </p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', lineHeight: 1, marginBottom: '2px' }}>
                  {day.avgRating.toFixed(1)}
                </p>
                <p style={{ fontSize: '9px', color: '#374151', fontFamily: '"DM Mono", monospace', marginBottom: '8px' }}>/5</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Vote size={9} color="#4b5563" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', fontFamily: '"DM Mono", monospace' }}>{day.voteCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Users size={9} color="#4b5563" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', fontFamily: '"DM Mono", monospace' }}>{day.uniqueUsers}</span>
                  </div>
                </div>

                <div style={{
                  padding: '3px 6px', borderRadius: '5px',
                  background: bg, border: `1px solid ${border}`,
                  fontSize: '9px', fontWeight: 700, color,
                  fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {q}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center',
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {Object.entries(QUALITY_MAP).map(([label, { color }]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: '"DM Mono", monospace' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGraph;
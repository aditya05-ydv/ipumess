import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Users, Vote, BarChart2 } from 'lucide-react';

const QUALITY_MAP = {
  'Very Good': { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  'Good':      { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Average':   { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'Bad':       { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
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
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '9px', padding: '10px 14px', fontSize: '12px',
    }}>
      <p style={{ color: '#64748b', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#f97316', fontWeight: 700, fontSize: '15px' }}>
        {val?.toFixed(2)} <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 5</span>
      </p>
      <p style={{ color, fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>{q}</p>
    </div>
  );
};

const WeeklyGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        borderRadius: '12px', border: '1px solid #e2e8f0',
        background: '#ffffff', padding: '40px', textAlign: 'center',
        fontSize: '12px', color: '#94a3b8',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        No rating data available yet
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '12px', border: '1px solid #e2e8f0',
      background: '#ffffff', overflow: 'hidden',
      margin: '16px 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart2 size={15} color="#2563eb" />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            Weekly Food Quality Ratings
          </h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Average scores across the week
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '20px 16px 8px', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false} tickLine={false}
            />
            <ReferenceLine y={3} stroke="#e2e8f0" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#bfdbfe', strokeWidth: 1 }} />
            <Line
              type="monotone" dataKey="avgRating" name="Avg Rating"
              stroke="#2563eb" strokeWidth={2.5}
              dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily cards */}
      <div style={{ padding: '4px 12px 16px' }}>
        <p style={{
          fontSize: '10px', color: '#64748b',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          marginBottom: '10px', paddingLeft: '4px',
        }}>
          Daily Summary
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
          {data.map((day, idx) => {
            const q = day.quality || getQuality(day.avgRating);
            const { color, bg, border } = QUALITY_MAP[q] || QUALITY_MAP['Bad'];
            return (
              <div key={idx} style={{
                borderRadius: '10px', padding: '12px 10px', textAlign: 'center',
                border: '1px solid #e2e8f0', background: '#f8fafc',
              }}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, color: '#2563eb',
                  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  {day.day}
                </p>
                <p style={{
                  fontSize: '22px', fontWeight: 800, color: '#f97316',
                  lineHeight: 1, marginBottom: '2px',
                }}>
                  {day.avgRating.toFixed(1)}
                </p>
                <p style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '8px' }}>/5</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Vote size={9} color="#94a3b8" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>{day.voteCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Users size={9} color="#94a3b8" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>{day.uniqueUsers}</span>
                  </div>
                </div>

                <div style={{
                  padding: '3px 6px', borderRadius: '5px',
                  background: bg, border: `1px solid ${border}`,
                  fontSize: '9px', fontWeight: 700, color,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
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
        padding: '12px 16px', borderTop: '1px solid #e2e8f0',
      }}>
        {Object.entries(QUALITY_MAP).map(([label, { color }]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGraph;
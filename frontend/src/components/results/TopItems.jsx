import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const getRatingColor = (rating) => {
  if (rating >= 4) return '#34d399';
  if (rating >= 3) return '#fbbf24';
  return '#f87171';
};

const getRatingBg = (rating) => {
  if (rating >= 4) return { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' };
  if (rating >= 3) return { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' };
  return { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' };
};

const RankBadge = ({ rank, type }) => (
  <div style={{
    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: type === 'highest' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
    border: type === 'highest' ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(248,113,113,0.2)',
    fontSize: '10px', fontWeight: 700,
    color: type === 'highest' ? '#34d399' : '#f87171',
    fontFamily: '"DM Mono", monospace',
  }}>
    {rank}
  </div>
);

const ItemCard = ({ item, idx, type }) => {
  const color = getRatingColor(item.avgRating);
  const { bg, border } = getRatingBg(item.avgRating);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px', borderRadius: '9px',
      border: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(255,255,255,0.02)',
      transition: 'border-color 0.15s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
    >
      <RankBadge rank={idx + 1} type={type} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 600, color: '#e2e8f0',
          fontFamily: '"DM Sans", sans-serif',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '2px',
        }}>
          {item.itemName}
        </p>
        <p style={{
          fontSize: '10px', color: '#374151',
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em',
        }}>
          {item.count} rating{item.count !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{
        padding: '4px 10px', borderRadius: '7px',
        background: bg, border: `1px solid ${border}`,
        fontSize: '13px', fontWeight: 700, color,
        fontFamily: '"DM Mono", monospace', flexShrink: 0,
      }}>
        {item.avgRating}
      </div>
    </div>
  );
};

const Section = ({ title, items, type }) => (
  <div style={{
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }}>
    {/* Section header */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: type === 'highest' ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.04)',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
        background: type === 'highest' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
        border: type === 'highest' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(248,113,113,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {type === 'highest'
          ? <TrendingUp size={14} color="#34d399" />
          : <TrendingDown size={14} color="#f87171" />
        }
      </div>
      <h3 style={{
        fontSize: '13px', fontWeight: 700,
        color: type === 'highest' ? '#34d399' : '#f87171',
        fontFamily: '"DM Sans", sans-serif',
        letterSpacing: '0.01em',
      }}>
        {title}
      </h3>
    </div>

    {/* Items */}
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <ItemCard key={idx} item={item} idx={idx} type={type} />
        ))
      ) : (
        <div style={{
          padding: '24px', textAlign: 'center',
          fontSize: '11px', color: '#374151',
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          No data available
        </div>
      )}
    </div>
  </div>
);

const TopItems = ({ data }) => {
  if (!data) {
    return (
      <div style={{
        padding: '32px', textAlign: 'center',
        fontSize: '11px', color: '#374151',
        fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        No rating data available yet
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '12px',
    }}>
      <Section title="Lowest Rated" items={data.lowestRated} type="lowest" />
      <Section title="Highest Rated" items={data.highestRated} type="highest" />
    </div>
  );
};

export default TopItems;
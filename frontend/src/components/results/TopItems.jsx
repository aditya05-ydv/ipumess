import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const getRatingColor = (rating) => {
  if (rating >= 4) return '#16a34a';
  if (rating >= 3) return '#d97706';
  return '#dc2626';
};

const getRatingBg = (rating) => {
  if (rating >= 4) return { bg: '#f0fdf4', border: '#bbf7d0' };
  if (rating >= 3) return { bg: '#fffbeb', border: '#fde68a' };
  return { bg: '#fef2f2', border: '#fecaca' };
};

const RankBadge = ({ rank, type }) => (
  <div style={{
    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: type === 'highest' ? '#f0fdf4' : '#fef2f2',
    border: type === 'highest' ? '1px solid #bbf7d0' : '1px solid #fecaca',
    fontSize: '10px', fontWeight: 700,
    color: type === 'highest' ? '#16a34a' : '#dc2626',
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
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
    }}>
      <RankBadge rank={idx + 1} type={type} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 600, color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '2px',
        }}>
          {item.itemName}
        </p>
        <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.06em' }}>
          {item.count} rating{item.count !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{
        padding: '4px 10px', borderRadius: '7px',
        background: bg, border: `1px solid ${border}`,
        fontSize: '13px', fontWeight: 700, color,
        flexShrink: 0,
      }}>
        {item.avgRating}
      </div>
    </div>
  );
};

const Section = ({ title, items, type }) => (
  <div style={{
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    overflow: 'hidden',
  }}>
    {/* Section header */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 16px',
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
        background: type === 'highest' ? '#f0fdf4' : '#fef2f2',
        border: type === 'highest' ? '1px solid #bbf7d0' : '1px solid #fecaca',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {type === 'highest'
          ? <TrendingUp size={14} color="#16a34a" />
          : <TrendingDown size={14} color="#dc2626" />
        }
      </div>
      <h3 style={{
        fontSize: '13px', fontWeight: 700,
        color: type === 'highest' ? '#16a34a' : '#dc2626',
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
          fontSize: '11px', color: '#94a3b8',
          letterSpacing: '0.1em', textTransform: 'uppercase',
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
        fontSize: '11px', color: '#94a3b8',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        borderRadius: '12px', border: '1px solid #e2e8f0',
        background: '#f8fafc',
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
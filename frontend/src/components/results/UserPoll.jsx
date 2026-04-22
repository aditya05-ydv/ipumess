import React, { useState } from 'react';
import { getTimeUntilPollExpiry } from '../../utils/timeUtils';

const UserPoll = ({ poll, onVote, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilPollExpiry(poll?.createdAt));

  React.useEffect(() => {
    if (!poll) return;
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilPollExpiry(poll.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  if (!poll) {
    return (
      <div style={{
        borderRadius: '12px', border: '1px solid #e2e8f0',
        background: '#ffffff', padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</div>
        <p style={{ color: '#64748b', fontSize: '13px' }}>No active poll at the moment. Check back later!</p>
      </div>
    );
  }

  const hasVoted = poll.hasVoted;
  const isExpired = timeRemaining.expired;

  const handleVote = async (optionIndex) => {
    if (hasVoted || isExpired) return;
    setSelectedOption(optionIndex);
    await onVote(poll._id, optionIndex);
  };

  return (
    <div style={{
      borderRadius: '12px', border: '1px solid #e2e8f0',
      background: '#ffffff', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🍽️</span>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Food Poll</h3>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: '20px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          fontSize: '10px', fontWeight: 700, color: '#2563eb',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          User Poll
        </div>
      </div>

      {/* Question */}
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.6 }}>
        {poll.question}
      </p>

      {/* Status Messages */}
      {hasVoted && !isExpired && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '10px', padding: '10px 14px',
        }}>
          <span style={{ color: '#16a34a', fontSize: '13px' }}>✓</span>
          <p style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
            You've voted! Results will be available after 24 hours.
          </p>
        </div>
      )}

      {isExpired && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: '10px', padding: '10px 14px',
        }}>
          <span style={{ fontSize: '13px' }}>⏱️</span>
          <p style={{ color: '#92400e', fontSize: '12px', fontWeight: 600 }}>
            This poll has expired. Check results below!
          </p>
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {poll.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const disabled = hasVoted || isExpired || isLoading;

          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={disabled}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '10px',
                border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: isSelected ? '#eff6ff' : '#f8fafc',
                color: isSelected ? '#1d4ed8' : '#0f172a',
                fontSize: '13px', fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isSelected ? 0.6 : 1,
              }}
            >
              <span>{option.text}</span>
              {!isExpired && (
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                  background: isSelected ? '#dbeafe' : '#f1f5f9',
                  border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  color: isSelected ? '#2563eb' : '#94a3b8',
                  fontWeight: 600,
                }}>
                  {option.votes} votes
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timer */}
      {!isExpired && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          paddingTop: '8px', borderTop: '1px solid #e2e8f0',
        }}>
          <span style={{ fontSize: '12px' }}>⏱️</span>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
            {timeRemaining.hours}h {timeRemaining.minutes}m remaining
          </span>
        </div>
      )}
    </div>
  );
};

export default UserPoll;

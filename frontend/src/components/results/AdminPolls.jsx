import React, { useState } from 'react';
import { getTimeUntilPollExpiry } from '../../utils/timeUtils';
import { ChevronDown, ChevronRight, Clock, CheckCircle2, ClipboardList } from 'lucide-react';

const AdminPolls = ({ polls, onVote, isLoading }) => {
  const [expandedPollId, setExpandedPollId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleVote = async (pollId, optionIndex) => {
    setSelectedOptions(prev => ({ ...prev, [pollId]: optionIndex }));
    await onVote(pollId, optionIndex);
  };

  const empty = !polls || polls.length === 0;

  return (
    <div style={{
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      overflow: 'hidden',
      margin: '16px 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ClipboardList size={15} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            Admin Polls & Questions
          </h3>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: '20px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          fontSize: '10px', fontWeight: 700, color: '#2563eb',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {empty ? 0 : polls.length} active
        </div>
      </div>

      {/* Empty state */}
      {empty ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          fontSize: '12px', color: '#94a3b8',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          No active admin polls at the moment.
        </div>
      ) : (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {polls.map((poll, pollIdx) => {
            const timeRemaining = getTimeUntilPollExpiry(poll.createdAt);
            const isExpired = timeRemaining.expired;
            const hasVoted = poll.hasVoted;
            const isExpanded = expandedPollId === poll._id;
            const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);

            return (
              <div
                key={poll._id}
                style={{
                  borderRadius: '10px',
                  border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  background: isExpanded ? '#eff6ff' : '#ffffff',
                  overflow: 'hidden',
                }}
              >
                {/* Poll row */}
                <div
                  onClick={() => setExpandedPollId(isExpanded ? null : poll._id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', cursor: 'pointer', gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#2563eb',
                    }}>
                      {pollIdx + 1}
                    </div>
                    <span style={{
                      fontSize: '13px', fontWeight: 600, color: '#0f172a',
                      lineHeight: 1.4, wordBreak: 'break-word',
                    }}>
                      {poll.question}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{
                      padding: '3px 8px', borderRadius: '6px',
                      background: isExpired ? '#f1f5f9' : '#f0fdf4',
                      border: isExpired ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                      fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: isExpired ? '#94a3b8' : '#16a34a',
                    }}>
                      {isExpired ? 'Expired' : 'Active'}
                    </div>
                    {isExpanded
                      ? <ChevronDown size={14} color="#94a3b8" />
                      : <ChevronRight size={14} color="#94a3b8" />
                    }
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '14px',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                      {poll.options.map((option, idx) => {
                        const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const isSelected = selectedOptions[poll._id] === idx;
                        const disabled = hasVoted || isExpired || isLoading;

                        return (
                          <button
                            key={idx}
                            onClick={() => !disabled && handleVote(poll._id, idx)}
                            disabled={disabled}
                            style={{
                              position: 'relative', overflow: 'hidden',
                              width: '100%', textAlign: 'left',
                              padding: '10px 14px', borderRadius: '8px',
                              border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#f8fafc',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              opacity: disabled && !isSelected ? 0.6 : 1,
                            }}
                          >
                            {/* Progress fill */}
                            <div style={{
                              position: 'absolute', top: 0, left: 0, height: '100%',
                              width: `${pct}%`,
                              background: isSelected ? '#dbeafe' : '#f1f5f9',
                              borderRight: pct > 0 ? '2px solid #bfdbfe' : 'none',
                            }} />

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{
                                fontSize: '13px', fontWeight: 600,
                                color: isSelected ? '#1d4ed8' : '#0f172a',
                                wordBreak: 'break-word', flex: 1,
                              }}>
                                {option.text}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>
                                  {pct}%
                                </span>
                                <span style={{
                                  padding: '2px 7px', borderRadius: '5px',
                                  background: '#eff6ff', border: '1px solid #bfdbfe',
                                  fontSize: '10px', fontWeight: 700, color: '#2563eb',
                                }}>
                                  {option.votes}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0', paddingTop: '10px',
                      flexWrap: 'wrap', gap: '6px',
                    }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} total
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {hasVoted && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={12} color="#16a34a" />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a' }}>
                              Voted
                            </span>
                          </div>
                        )}
                        {!isExpired && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={11} color="#d97706" />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706' }}>
                              {timeRemaining.hours}h {timeRemaining.minutes}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
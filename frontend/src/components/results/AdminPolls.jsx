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
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      margin: '16px 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(244,63,94,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ClipboardList size={15} color="#fb7185" />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif' }}>
            Admin Polls & Questions
          </h3>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: '20px',
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
          fontSize: '10px', fontWeight: 700, color: '#fb7185',
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {empty ? 0 : polls.length} active
        </div>
      </div>

      {/* Empty state */}
      {empty ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          fontSize: '11px', color: '#374151',
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase',
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
                  border: isExpanded ? '1px solid rgba(244,63,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  background: isExpanded ? 'rgba(244,63,94,0.04)' : 'rgba(255,255,255,0.02)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
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
                      background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: '#c4b5fd',
                      fontFamily: '"DM Mono", monospace',
                    }}>
                      {pollIdx + 1}
                    </div>
                    <span style={{
                      fontSize: '13px', fontWeight: 600, color: '#cbd5e1',
                      fontFamily: '"DM Sans", sans-serif', lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}>
                      {poll.question}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{
                      padding: '3px 8px', borderRadius: '6px',
                      background: isExpired ? 'rgba(107,114,128,0.15)' : 'rgba(52,211,153,0.1)',
                      border: isExpired ? '1px solid rgba(107,114,128,0.2)' : '1px solid rgba(52,211,153,0.2)',
                      fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: isExpired ? '#6b7280' : '#34d399',
                      fontFamily: '"DM Mono", monospace',
                    }}>
                      {isExpired ? 'Expired' : 'Active'}
                    </div>
                    {isExpanded
                      ? <ChevronDown size={14} color="#4b5563" />
                      : <ChevronRight size={14} color="#4b5563" />
                    }
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.2)',
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
                              border: isSelected
                                ? '1px solid rgba(244,63,94,0.45)'
                                : '1px solid rgba(255,255,255,0.06)',
                              background: isSelected
                                ? 'rgba(244,63,94,0.1)'
                                : 'rgba(255,255,255,0.03)',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              opacity: disabled && !isSelected ? 0.6 : 1,
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 0 12px rgba(244,63,94,0.15)' : 'none',
                            }}
                          >
                            {/* Progress fill */}
                            <div style={{
                              position: 'absolute', top: 0, left: 0, height: '100%',
                              width: `${pct}%`,
                              background: isSelected ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)',
                              transition: 'width 0.7s ease',
                            }} />

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#fda4af' : '#94a3b8', fontFamily: '"DM Sans", sans-serif', wordBreak: 'break-word', flex: 1 }}>
                                {option.text}
                              </span>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                              }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace' }}>
                                  {pct}%
                                </span>
                                <span style={{
                                  padding: '2px 7px', borderRadius: '5px',
                                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                  fontSize: '10px', fontWeight: 700, color: '#818cf8',
                                  fontFamily: '"DM Mono", monospace',
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
                      borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px',
                      flexWrap: 'wrap', gap: '6px',
                    }}>
                      <span style={{ fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace' }}>
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} total
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {hasVoted && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={12} color="#34d399" />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', fontFamily: '"DM Mono", monospace' }}>
                              Voted
                            </span>
                          </div>
                        )}
                        {!isExpired && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={11} color="#fbbf24" />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', fontFamily: '"DM Mono", monospace' }}>
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
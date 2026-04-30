import { useEffect, useState } from 'react';
import { Loader2, LogIn, ChevronLeft, Vote, Plus, X, Send, CheckCircle2 } from 'lucide-react';
import { pollService, fastingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';

export const Polls = ({ onVote, onBack }) => {
  const [userPolls, setUserPolls] = useState([]);
  const [adminPolls, setAdminPolls] = useState([]);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draft, setDraft] = useState({ question: '', options: ['', ''] });
  const [creating, setCreating] = useState(false);
  const [fasting, setFasting] = useState(null);
  const [fastingName, setFastingName] = useState('');
  const [fastingRoom, setFastingRoom] = useState('');
  const [fastingLoading, setFastingLoading] = useState(false);
  const [fastingEditing, setFastingEditing] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { clearNotification } = useNotifications();

  const fetchFasting = async () => {
    try {
      const data = await fastingService.getFasting();
      setFasting(data);
      if (data.userEntry) {
        setFastingName(data.userEntry.name);
        setFastingRoom(data.userEntry.roomNumber);
      }
    } catch (error) {
      console.error('Failed to fetch fasting register:', error);
    }
  };

  const fetchPolls = async () => {
    try {
      const data = await pollService.getCurrentPolls();
      setUserPolls(data.userPolls || []);
      setAdminPolls(data.adminPolls || []);
      setRemainingSlots(data.remainingSlots ?? 2);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFasting();
    fetchPolls();
    clearNotification('polls');
    if (!socket) return undefined;
    const handlePollUpdate = () => fetchPolls();
    socket.on('pollUpdate', handlePollUpdate);
    return () => socket.off('pollUpdate', handlePollUpdate);
  }, [socket]);

  const handleFastingSubmit = async () => {
    if (!fastingName.trim() || !fastingRoom.trim()) { alert('Please enter both name and room number'); return; }
    setFastingLoading(true);
    try {
      await fastingService.submit(fastingName, fastingRoom);
      await fetchFasting();
      setFastingEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit');
    } finally {
      setFastingLoading(false);
    }
  };

  const handleFastingEdit = async () => {
    if (!fastingName.trim() || !fastingRoom.trim()) { alert('Please enter both name and room number'); return; }
    setFastingLoading(true);
    try {
      await fastingService.edit(fastingName, fastingRoom);
      await fetchFasting();
      setFastingEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update');
    } finally {
      setFastingLoading(false);
    }
  };

  const handleFastingDelete = async () => {
    if (!window.confirm('Remove your name from the fasting register?')) return;
    setFastingLoading(true);
    try {
      await fastingService.deleteEntry();
      setFastingName('');
      setFastingRoom('');
      await fetchFasting();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove');
    } finally {
      setFastingLoading(false);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!user) { onVote(); return; }
    try {
      await pollService.vote(pollId, optionIndex);
      fetchPolls();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Voting failed');
    }
  };

  const addOption = () => {
    if (draft.options.length < 6) setDraft({ ...draft, options: [...draft.options, ''] });
  };

  const removeOption = (idx) => {
    if (draft.options.length > 2) setDraft({ ...draft, options: draft.options.filter((_, i) => i !== idx) });
  };

  const updateOption = (idx, value) => {
    const updated = [...draft.options];
    updated[idx] = value;
    setDraft({ ...draft, options: updated });
  };

  const handleCreate = async () => {
    const options = draft.options.map(o => o.trim()).filter(Boolean);
    if (!draft.question.trim()) { alert('Please enter a question.'); return; }
    if (options.length < 2) { alert('Please enter at least 2 options.'); return; }
    if (remainingSlots <= 0) { alert('No poll slots remaining.'); return; }
    setCreating(true);
    try {
      await pollService.createPoll({ question: draft.question.trim(), options });
      setDraft({ question: '', options: ['', ''] });
      setShowCreateForm(false);
      fetchPolls();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const PollCard = ({ poll }) => {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    return (
      <div style={{
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, flex: 1 }}>
            {poll.question}
          </p>
          {poll.hasVoted && <CheckCircle2 size={16} color="#16a34a" style={{ marginLeft: '8px', flexShrink: 0 }} />}
        </div>

        {poll.hasVoted && (
          <p style={{ fontSize: '10px', color: '#16a34a', marginBottom: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Voted · Tap another to change
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
          {poll.options.map((option, idx) => {
            const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <button
                key={option.text}
                onClick={() => handleVote(poll._id, idx)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  width: '100%', textAlign: 'left',
                  padding: '11px 14px', borderRadius: '9px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${pct}%`,
                  background: '#eff6ff',
                  borderRight: pct > 0 ? '2px solid #bfdbfe' : 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {option.text}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                    {pct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

     
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
        <Loader2 size={28} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '12px', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Loading polls...
        </p>
      </div>
    );
  }

  const allPolls = [...adminPolls, ...userPolls];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Community
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Student Voice
          </h2>
        </div>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          <ChevronLeft size={15} /> Back
        </button>
      </div>

      {/* Poll Slots Banner */}
      {user && (
        <div style={{
          marginBottom: '24px', padding: '14px 18px', borderRadius: '12px',
          border: `1px solid ${remainingSlots > 0 ? '#bfdbfe' : '#fecaca'}`,
          background: remainingSlots > 0 ? '#eff6ff' : '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: remainingSlots > 0 ? '#2563eb' : '#dc2626', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {remainingSlots > 0 ? `${remainingSlots} poll slot${remainingSlots !== 1 ? 's' : ''} remaining` : 'No slots remaining'}
            </p>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {remainingSlots > 0 ? 'Your hostel can create more polls' : 'Wait 24h for existing polls to expire'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: i < (2 - remainingSlots) ? '#e2e8f0' : '#2563eb',
                border: '1px solid #bfdbfe',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Create Poll Button */}
      {user && remainingSlots > 0 && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            width: '100%', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px', borderRadius: '12px',
            border: '2px dashed #bfdbfe',
            background: '#eff6ff',
            color: '#2563eb', cursor: 'pointer',
            fontSize: '13px', fontWeight: 700,
          }}
        >
          <Plus size={16} /> Create a Poll
        </button>
      )}

      {/* Create Poll Form */}
      {showCreateForm && (
        <div style={{
          marginBottom: '24px', padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>New Poll</p>
            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>

          <input
            value={draft.question}
            onChange={e => setDraft({ ...draft, question: e.target.value })}
            placeholder="Ask your hostel a question..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              color: '#0f172a', fontSize: '13px',
              outline: 'none', marginBottom: '12px',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {draft.options.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  value={opt}
                  onChange={e => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '9px',
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#0f172a', fontSize: '13px', outline: 'none',
                  }}
                />
                {draft.options.length > 2 && (
                  <button onClick={() => removeOption(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {draft.options.length < 6 && (
            <button
              onClick={addOption}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#2563eb', fontSize: '12px', fontWeight: 600,
                marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Plus size={13} /> Add option
            </button>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px',
              background: '#2563eb', border: 'none',
              color: '#ffffff', fontSize: '13px', fontWeight: 700,
              cursor: creating ? 'default' : 'pointer',
              opacity: creating ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Send size={14} />
            {creating ? 'Creating...' : 'Post Poll'}
          </button>
        </div>
      )}

      {/* Fasting Register */}
      {fasting && (fasting.isActive || fasting.entries?.length > 0) && (
        <div style={{
          marginBottom: '28px', borderRadius: '12px',
          border: '1px solid #fde68a', background: '#ffffff', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #fef3c7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: '#fffbeb', border: '1px solid #fde68a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              }}>🌙</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                  {fasting.festivalName || 'Fasting Register'}
                </p>
                <p style={{ fontSize: '10px', color: '#a16207', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {fasting.isActive ? 'Open — Add your name' : 'Closed — View only'}
                </p>
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
              background: fasting.isActive ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${fasting.isActive ? '#bbf7d0' : '#fecaca'}`,
              color: fasting.isActive ? '#16a34a' : '#dc2626',
            }}>
              {fasting.entries?.length || 0} fasting
            </div>
          </div>

          {fasting.isActive && user && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #fef3c7' }}>
              {!fasting.hasSubmitted || fastingEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      value={fastingName}
                      onChange={e => setFastingName(e.target.value)}
                      placeholder="Your full name"
                      style={{
                        flex: 2, padding: '10px 14px', borderRadius: '9px',
                        border: '1px solid #fde68a', background: '#fffbeb',
                        color: '#0f172a', fontSize: '13px', outline: 'none',
                      }}
                    />
                    <input
                      value={fastingRoom}
                      onChange={e => setFastingRoom(e.target.value)}
                      placeholder="Room no."
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: '9px',
                        border: '1px solid #fde68a', background: '#fffbeb',
                        color: '#0f172a', fontSize: '13px', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={fasting.hasSubmitted ? handleFastingEdit : handleFastingSubmit}
                      disabled={fastingLoading}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '9px',
                        background: '#fffbeb', border: '1px solid #fde68a',
                        color: '#92400e', fontSize: '13px', fontWeight: 700,
                        cursor: fastingLoading ? 'default' : 'pointer',
                        opacity: fastingLoading ? 0.6 : 1,
                      }}
                    >
                      {fastingLoading ? 'Saving...' : fasting.hasSubmitted ? 'Update Name' : 'Submit'}
                    </button>
                    {fastingEditing && (
                      <button
                        onClick={() => { setFastingEditing(false); setFastingName(fasting.userEntry?.name || ''); setFastingRoom(fasting.userEntry?.roomNumber || ''); }}
                        style={{
                          padding: '10px 16px', borderRadius: '9px',
                          background: 'none', border: '1px solid #e2e8f0',
                          color: '#64748b', fontSize: '13px', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>✓ Your name is registered</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setFastingEditing(true)}
                      style={{
                        padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                        background: '#fffbeb', border: '1px solid #fde68a',
                        color: '#92400e', cursor: 'pointer',
                      }}
                    >Edit</button>
                    <button
                      onClick={handleFastingDelete}
                      style={{
                        padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                        background: '#fef2f2', border: '1px solid #fecaca',
                        color: '#dc2626', cursor: 'pointer',
                      }}
                    >Remove</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fasting.entries?.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '12px 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                No entries yet — be the first
              </p>
            ) : (
              fasting.entries.map((entry, idx) => (
                <div
                  key={entry._id || idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '9px',
                    background: entry.userId === fasting.userEntry?.userId ? '#fffbeb' : '#f8fafc',
                    border: `1px solid ${entry.userId === fasting.userEntry?.userId ? '#fde68a' : '#e2e8f0'}`,
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', minWidth: '22px' }}>
                    {idx + 1}.
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', flex: 1 }}>
                    {entry.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>
                    Room {entry.roomNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Auto-delete Info Banner */}
<div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
  <div style={{ fontSize: '15px', flexShrink: 0 }}>ℹ️</div>
  <div>
    <p style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px' }}>Poll Auto-Delete Timing</p>
    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
      User polls expire after <span style={{ fontWeight: '700', color: '#2563eb' }}>24 hours</span> and are permanently deleted after <span style={{ fontWeight: '700', color: '#2563eb' }}>3 days.</span> Admin polls are deleted after <span style={{ fontWeight: '700', color: '#2563eb' }}>3 days.</span>
    </p>
  </div>
</div>

      {/* Polls List Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Vote size={15} color="#2563eb" />
        </div>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Active Polls</h3>
        <div style={{
          marginLeft: '4px', padding: '2px 8px', borderRadius: '20px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          fontSize: '10px', fontWeight: 700, color: '#2563eb',
        }}>
          {allPolls.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allPolls.map((poll, i) => (
          <PollCard key={poll._id} poll={poll} index={i} />
        ))}

        {allPolls.length === 0 && (
          <div style={{
            borderRadius: '12px', border: '1px solid #e2e8f0',
            background: '#f8fafc', padding: '32px',
            textAlign: 'center', color: '#94a3b8',
            fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            No active polls — be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};
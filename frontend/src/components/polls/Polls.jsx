import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Vote, Loader2, Plus, X, Send, CheckCircle2 } from 'lucide-react';
import { pollService, fastingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const Polls = ({ onVote, onBack }) => {
  const [userPolls, setUserPolls] = useState([]);
  const [adminPolls, setAdminPolls] = useState([]);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draft, setDraft] = useState({ question: '', options: ['', ''] });
  const [creating, setCreating] = useState(false);
  // FASTING REGISTER FEATURE - state (remove this block to delete feature)
  const [fasting, setFasting] = useState(null);
  const [fastingName, setFastingName] = useState('');
  const [fastingRoom, setFastingRoom] = useState('');
  const [fastingLoading, setFastingLoading] = useState(false);
  const [fastingEditing, setFastingEditing] = useState(false);
  // END FASTING REGISTER FEATURE - state
  const { user } = useAuth();
  const { socket } = useSocket();

  // FASTING REGISTER FEATURE - fetch (remove this block to delete feature)
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
  // END FASTING REGISTER FEATURE - fetch

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
    fetchFasting(); // FASTING REGISTER FEATURE - call (remove to delete feature)
    fetchPolls();
    if (!socket) return undefined;
    const handlePollUpdate = () => fetchPolls();
    socket.on('pollUpdate', handlePollUpdate);
    return () => socket.off('pollUpdate', handlePollUpdate);
  }, [socket]);

  // FASTING REGISTER FEATURE - handlers (remove this block to delete feature)
  const handleFastingSubmit = async () => {
    if (!fastingName.trim() || !fastingRoom.trim()) {
      alert('Please enter both name and room number');
      return;
    }
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
    if (!fastingName.trim() || !fastingRoom.trim()) {
      alert('Please enter both name and room number');
      return;
    }
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
  // END FASTING REGISTER FEATURE - handlers

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
    if (draft.options.length < 6) {
      setDraft({ ...draft, options: [...draft.options, ''] });
    }
  };

  const removeOption = (idx) => {
    if (draft.options.length > 2) {
      setDraft({ ...draft, options: draft.options.filter((_, i) => i !== idx) });
    }
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
    if (remainingSlots <= 0) { alert('No poll slots remaining. Wait for existing polls to expire.'); return; }

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

  const PollCard = ({ poll, index }) => {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

    return (
      <motion.div
        key={poll._id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.4, flex: 1 }}>
            {poll.question}
          </p>
          {poll.hasVoted && (
            <CheckCircle2 size={16} color="#34d399" style={{ marginLeft: '8px', flexShrink: 0 }} />
          )}
        </div>

        {poll.hasVoted && (
          <p style={{ fontSize: '10px', color: '#34d399', fontFamily: '"DM Mono", monospace', marginBottom: '12px', letterSpacing: '0.1em' }}>
            VOTED • TAP ANOTHER TO CHANGE
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
          {poll.options.map((option, idx) => {
            const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <motion.button
                key={option.text}
                onClick={() => handleVote(poll._id, idx)}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  width: '100%', textAlign: 'left',
                  padding: '11px 14px', borderRadius: '9px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${pct}%`,
                  background: 'rgba(99,102,241,0.08)',
                  transition: 'width 0.8s ease',
                  borderRight: pct > 0 ? '1px solid rgba(99,102,241,0.15)' : 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', fontFamily: '"DM Sans", sans-serif' }}>
                    {option.text}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace' }}>
                    {pct}%
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p style={{ marginTop: '12px', fontSize: '10px', color: '#374151', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em' }}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} total
        </p>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
        <Loader2 size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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
          <p style={{ fontSize: '10px', color: '#4b5563', fontFamily: '"DM Mono", monospace', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Community
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Student Voice
          </h2>
        </div>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <ChevronLeft size={15} /> Back
        </motion.button>
      </div>

      {/* Poll Slots Banner */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: '12px',
            border: `1px solid ${remainingSlots > 0 ? 'rgba(99,102,241,0.25)' : 'rgba(239,68,68,0.25)'}`,
            background: remainingSlots > 0 ? 'rgba(99,102,241,0.06)' : 'rgba(239,68,68,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: remainingSlots > 0 ? '#818cf8' : '#f87171', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {remainingSlots > 0 ? `${remainingSlots} poll slot${remainingSlots !== 1 ? 's' : ''} remaining` : 'No slots remaining'}
            </p>
            <p style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif', marginTop: '2px' }}>
              {remainingSlots > 0 ? 'Your hostel can create more polls' : 'Wait 24h for existing polls to expire'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: i < (2 - remainingSlots) ? 'rgba(255,255,255,0.1)' : '#6366f1',
                border: '1px solid rgba(99,102,241,0.4)',
              }} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Poll Button */}
      {user && remainingSlots > 0 && !showCreateForm && (
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px', borderRadius: '12px',
            border: '1px dashed rgba(99,102,241,0.4)',
            background: 'rgba(99,102,241,0.05)',
            color: '#818cf8', cursor: 'pointer',
            fontSize: '13px', fontWeight: 700,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <Plus size={16} /> Create a Poll
        </motion.button>
      )}

      {/* Create Poll Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid rgba(99,102,241,0.25)',
              background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
                New Poll
              </p>
              <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
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
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                color: '#e2e8f0', fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif',
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
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#e2e8f0', fontSize: '13px',
                      fontFamily: '"DM Sans", sans-serif', outline: 'none',
                    }}
                  />
                  {draft.options.length > 2 && (
                    <button onClick={() => removeOption(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
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
                  color: '#6366f1', fontSize: '12px', fontWeight: 600,
                  fontFamily: '"DM Sans", sans-serif', marginBottom: '14px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={13} /> Add option
              </button>
            )}

            <motion.button
              onClick={handleCreate}
              disabled={creating}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '13px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                fontFamily: '"DM Sans", sans-serif',
                cursor: creating ? 'default' : 'pointer',
                opacity: creating ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Send size={14} />
              {creating ? 'Creating...' : 'Post Poll'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ============================================================ */}
      {/* FASTING REGISTER FEATURE - UI (remove this block to delete)  */}
      {/* ============================================================ */}
      {fasting && (fasting.isActive || fasting.entries?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '28px',
            borderRadius: '14px',
            border: '1px solid rgba(251,191,36,0.2)',
            background: 'linear-gradient(135deg, #1a1608 0%, #111520 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(251,191,36,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px',
              }}>🌙</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', fontFamily: '"DM Sans", sans-serif' }}>
                  {fasting.festivalName || 'Fasting Register'}
                </p>
                <p style={{ fontSize: '10px', color: '#78716c', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
                  {fasting.isActive ? 'OPEN — ADD YOUR NAME' : 'CLOSED — VIEW ONLY'}
                </p>
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
              fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em',
              background: fasting.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${fasting.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`,
              color: fasting.isActive ? '#4ade80' : '#f87171',
            }}>
              {fasting.entries?.length || 0} fasting
            </div>
          </div>

          {/* Submit / Edit Form — only if active and logged in */}
          {fasting.isActive && user && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(251,191,36,0.08)' }}>
              {!fasting.hasSubmitted || fastingEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      value={fastingName}
                      onChange={e => setFastingName(e.target.value)}
                      placeholder="Your full name"
                      style={{
                        flex: 2, padding: '10px 14px', borderRadius: '9px',
                        border: '1px solid rgba(251,191,36,0.2)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#e2e8f0', fontSize: '13px',
                        fontFamily: '"DM Sans", sans-serif', outline: 'none',
                      }}
                    />
                    <input
                      value={fastingRoom}
                      onChange={e => setFastingRoom(e.target.value)}
                      placeholder="Room no."
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: '9px',
                        border: '1px solid rgba(251,191,36,0.2)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#e2e8f0', fontSize: '13px',
                        fontFamily: '"DM Sans", sans-serif', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      onClick={fasting.hasSubmitted ? handleFastingEdit : handleFastingSubmit}
                      disabled={fastingLoading}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '9px',
                        background: 'rgba(251,191,36,0.15)',
                        border: '1px solid rgba(251,191,36,0.35)',
                        color: '#fbbf24', fontSize: '13px', fontWeight: 700,
                        fontFamily: '"DM Sans", sans-serif',
                        cursor: fastingLoading ? 'default' : 'pointer',
                        opacity: fastingLoading ? 0.6 : 1,
                      }}
                    >
                      {fastingLoading ? 'Saving...' : fasting.hasSubmitted ? 'Update Name' : 'Submit'}
                    </motion.button>
                    {fastingEditing && (
                      <button
                        onClick={() => { setFastingEditing(false); setFastingName(fasting.userEntry?.name || ''); setFastingRoom(fasting.userEntry?.roomNumber || ''); }}
                        style={{
                          padding: '10px 16px', borderRadius: '9px',
                          background: 'none', border: '1px solid rgba(255,255,255,0.07)',
                          color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#4ade80', fontFamily: '"DM Mono", monospace' }}>
                    ✓ YOUR NAME IS REGISTERED
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setFastingEditing(true)}
                      style={{
                        padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                        color: '#fbbf24', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleFastingDelete}
                      style={{
                        padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Entries List */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fasting.entries?.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#44403c', fontFamily: '"DM Mono", monospace', textAlign: 'center', padding: '12px 0', letterSpacing: '0.1em' }}>
                NO ENTRIES YET — BE THE FIRST
              </p>
            ) : (
              fasting.entries.map((entry, idx) => (
                <motion.div
                  key={entry._id || idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '9px',
                    background: entry.userId === fasting.userEntry?.userId
                      ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)',
                    border: entry.userId === fasting.userEntry?.userId
                      ? '1px solid rgba(251,191,36,0.15)' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', fontFamily: '"DM Mono", monospace', minWidth: '22px' }}>
                    {idx + 1}.
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', flex: 1 }}>
                    {entry.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#fbbf24', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                    Room {entry.roomNumber}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
      {/* END FASTING REGISTER FEATURE - UI */}

      {/* Polls List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Vote size={15} color="#818cf8" />
        </div>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif' }}>
          Active Polls
        </h3>
        <div style={{
          marginLeft: '4px', padding: '2px 8px', borderRadius: '20px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '10px', fontWeight: 700, color: '#818cf8',
          fontFamily: '"DM Mono", monospace',
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
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)', padding: '32px',
            textAlign: 'center', color: '#374151',
            fontSize: '12px', fontFamily: '"DM Mono", monospace',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            No active polls — be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};
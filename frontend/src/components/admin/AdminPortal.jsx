import { useEffect, useState } from 'react';
import { ChevronLeft, UtensilsCrossed, Vote, Save, Plus, Trash2, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { menuService, pollService, ratingService, fastingService } from '../../services/api';
import SuggestionBox from './SuggestionBox';

const emptyMeals = () => ({ breakfast: '', lunch: '', snacks: '', dinner: '' });
const linesToItems = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean);

export const AdminPortal = ({ onBack }) => {
  const { user } = useAuth();
  const hostel = user?.hostel || 'Unknown Hostel';

  const [menu, setMenu] = useState([]);
  const [polls, setPolls] = useState([]);
  const [weeklyGraphData, setWeeklyGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [editingDay, setEditingDay] = useState(null);
  const [draftMeals, setDraftMeals] = useState(emptyMeals());
  const [pollDraft, setPollDraft] = useState({ question: '', options: '' });
  const [deletingPollId, setDeletingPollId] = useState(null);
  const [resettingRatings, setResettingRatings] = useState(false);
  const [fastingData, setFastingData] = useState(null);
  const [fastingFestivalInput, setFastingFestivalInput] = useState('');
  const [fastingActionLoading, setFastingActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user) { alert('❌ Error: Not logged in as admin.'); setLoading(false); onBack?.(); return; }
      const [menuData, pollData, graphData, fastingRes] = await Promise.all([
        menuService.getMenu(user?.hostelId || 'bh1'),
        pollService.getPolls(),
        ratingService.getWeeklyGraphData(),
        fastingService.getFasting(),
      ]);
      setMenu(menuData.weeklyMenu || []);
      setPolls(pollData || []);
      setWeeklyGraphData(graphData || []);
      setFastingData(fastingRes || null);
    } catch (error) {
      alert(`❌ Failed to load admin dashboard:\n${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.hostelId]);

  const openMenuEditor = (dayItem) => {
    setEditingDay(dayItem.day);
    setDraftMeals({
      breakfast: dayItem.menu.breakfast.split(' + ').join('\n'),
      lunch: dayItem.menu.lunch.split(' + ').join('\n'),
      snacks: dayItem.menu.snacks.split(' + ').join('\n'),
      dinner: dayItem.menu.dinner.split(' + ').join('\n'),
    });
  };

  const saveMenu = async () => {
    if (!editingDay) return;
    try {
      await menuService.updateMenu(user?.hostelId || 'bh1', editingDay, {
        breakfast: linesToItems(draftMeals.breakfast),
        lunch: linesToItems(draftMeals.lunch),
        snacks: linesToItems(draftMeals.snacks),
        dinner: linesToItems(draftMeals.dinner),
      });
      setEditingDay(null);
      loadData();
      alert('Menu saved successfully!');
    } catch (error) {
      alert('Failed to save menu: ' + (error.response?.data?.message || error.message));
    }
  };

  const createPoll = async () => {
    const options = pollDraft.options.split('\n').map((item) => item.trim()).filter(Boolean);
    if (!pollDraft.question || options.length < 2) { alert('Enter a question and at least two options.'); return; }
    try {
      await pollService.createPoll({ question: pollDraft.question, options, type: 'admin' });
      setPollDraft({ question: '', options: '' });
      loadData();
      alert('Poll created successfully!');
    } catch (error) {
      alert('Failed to create poll: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDeletePoll = async () => {
    try {
      await pollService.deletePoll(deletingPollId);
      setDeletingPollId(null);
      loadData();
      alert('Poll deleted!');
    } catch (error) {
      alert('Failed to delete poll: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleActivateFasting = async () => {
    if (!fastingFestivalInput.trim()) { alert('Please enter a festival name'); return; }
    setFastingActionLoading(true);
    try {
      await fastingService.activate(fastingFestivalInput.trim());
      setFastingFestivalInput('');
      loadData();
      alert('✅ Fasting register activated!');
    } catch (error) {
      alert('Failed to activate: ' + (error.response?.data?.message || error.message));
    } finally { setFastingActionLoading(false); }
  };

  const handleDeactivateFasting = async () => {
    if (!window.confirm('Deactivate the fasting register?')) return;
    setFastingActionLoading(true);
    try {
      await fastingService.deactivate();
      loadData();
      alert('Fasting register deactivated.');
    } catch (error) {
      alert('Failed to deactivate: ' + (error.response?.data?.message || error.message));
    } finally { setFastingActionLoading(false); }
  };

  const handlePrintFasting = () => {
    const entries = fastingData?.entries || [];
    const festival = fastingData?.festivalName || 'Fasting Register';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>${festival}</title><style>body{font-family:Arial,sans-serif;padding:30px;}h1{font-size:22px;margin-bottom:4px;}p{color:#666;margin-bottom:20px;font-size:13px;}table{width:100%;border-collapse:collapse;}th{background:#f3f4f6;text-align:left;padding:10px 14px;font-size:13px;border:1px solid #e5e7eb;}td{padding:10px 14px;font-size:13px;border:1px solid #e5e7eb;}tr:nth-child(even) td{background:#f9fafb;}</style></head><body><h1>${festival}</h1><p>Total: ${entries.length} | Printed: ${new Date().toLocaleString()}</p><table><thead><tr><th>#</th><th>Name</th><th>Room</th><th>Submitted At</th></tr></thead><tbody>${entries.map((e, i) => `<tr><td>${i + 1}</td><td>${e.name}</td><td>${e.roomNumber}</td><td>${new Date(e.submittedAt).toLocaleString()}</td></tr>`).join('')}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleResetRatings = () => {
    if (window.confirm('⚠️ Reset ALL ratings? This cannot be undone.')) resetRatings();
  };

  const resetRatings = async () => {
    setResettingRatings(true);
    try {
      await ratingService.resetAllRatings();
      loadData();
      alert('✅ All ratings reset!');
    } catch (error) {
      alert('Failed to reset: ' + (error.response?.data?.message || error.message));
    } finally { setResettingRatings(false); }
  };

  const totalVotes = polls.reduce((sum, poll) => sum + poll.options.reduce((s, o) => s + o.votes, 0), 0);
  const activePollsCount = polls.filter(p => !p.isExpired).length;
  const totalRatings = weeklyGraphData.reduce((sum, day) => sum + day.voteCount, 0);

  if (loading) {
    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#64748b' }}>
        Loading admin dashboard...
      </div>
    );
  }

  const tabs = [
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'polls', label: 'Polls', icon: Vote },
    { id: 'ratings', label: 'Ratings', icon: BarChart3 },
    { id: 'fasting', label: 'Fasting', icon: UtensilsCrossed },
    { id: 'suggestions', label: 'Suggestions', icon: BarChart3 },
  ];

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '40px 24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>Admin Dashboard</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Managing <span style={{ fontWeight: '600', color: '#0f172a' }}>{hostel}</span></p>
        </div>
        <button
          onClick={() => { onBack(); window.scrollTo(0, 0); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', fontWeight: '500', fontSize: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
        >
          <ChevronLeft size={17} /> Exit Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Active Polls', value: activePollsCount, color: '#2563eb' },
          { label: 'Total Votes', value: totalVotes, color: '#7c3aed' },
          { label: 'Ratings', value: totalRatings, color: '#16a34a' },
          { label: 'Menu Days', value: menu.length, color: '#d97706' },
          { label: 'Hostel', value: hostel, color: '#0891b2' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color, margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', fontSize: '13.5px', fontWeight: '500', background: 'none', border: 'none', borderBottom: activeTab === id ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === id ? '#2563eb' : '#64748b', cursor: 'pointer', marginBottom: '-1px' }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>Weekly Menu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {menu.map((day) => (
              <div key={day.day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: '600', color: '#0f172a', margin: '0 0 4px' }}>{day.day}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Lunch: {day.menu.lunch}</p>
                </div>
                <button
                  onClick={() => openMenuEditor(day)}
                  style={{ marginLeft: '16px', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Polls Tab */}
      {activeTab === 'polls' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>Create Poll</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                value={pollDraft.question}
                onChange={(e) => setPollDraft({ ...pollDraft, question: e.target.value })}
                placeholder="Poll question"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
              />
              <textarea
                value={pollDraft.options}
                onChange={(e) => setPollDraft({ ...pollDraft, options: e.target.value })}
                placeholder="One option per line"
                rows={5}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={createPoll}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={15} /> Create Poll
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>Active Polls ({activePollsCount})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '384px', overflowY: 'auto' }}>
              {polls.filter(p => !p.isExpired).length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>No active polls yet</p>
              ) : (
                polls.filter(p => !p.isExpired).map((poll) => (
                  <div key={poll._id} style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ fontWeight: '500', fontSize: '13px', color: '#0f172a', margin: 0 }}>{poll.question}</h4>
                      <button onClick={() => setDeletingPollId(poll._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', marginLeft: '8px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {poll.options.map((option) => {
                        const total = poll.options.reduce((sum, item) => sum + item.votes, 0);
                        const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                        return (
                          <div key={option.text} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#475569' }}>{option.text}</span>
                            <span style={{ fontWeight: '600', color: '#2563eb' }}>{option.votes} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>Weekly Ratings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {weeklyGraphData.map((day) => (
                <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '80px', fontSize: '13px', fontWeight: '500', color: '#475569', flexShrink: 0 }}>{day.day}</div>
                  <div style={{ flex: 1, height: '28px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(day.avgRating / 5) * 100}%`, backgroundColor: day.avgRating >= 4 ? '#16a34a' : day.avgRating >= 3 ? '#d97706' : '#ef4444', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px' }}>
                      {day.avgRating > 0 && <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>{day.avgRating.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div style={{ width: '100px', textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0 0 2px' }}>{day.voteCount} ratings</p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{day.quality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleResetRatings}
              disabled={resettingRatings}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', color: '#ffffff', backgroundColor: '#ef4444', border: 'none', cursor: 'pointer', opacity: resettingRatings ? 0.5 : 1 }}
            >
              <AlertTriangle size={15} />
              {resettingRatings ? 'Resetting...' : 'Reset All Ratings'}
            </button>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', margin: '0 0 6px' }}>Auto Reset</p>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>Ratings older than 30 days are removed automatically every day at midnight.</p>
            </div>
          </div>
        </div>
      )}

      {/* Fasting Tab */}
      {activeTab === 'fasting' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>Fasting Register Control</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Activate to let students register their fasting. Auto-deletes after 48 hours.</p>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px' }}>Current Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: fastingData?.isActive ? '#16a34a' : '#ef4444' }} />
                <p style={{ fontWeight: '700', color: fastingData?.isActive ? '#16a34a' : '#ef4444', margin: 0 }}>
                  {fastingData?.isActive ? `ACTIVE — ${fastingData.festivalName}` : 'INACTIVE'}
                </p>
              </div>
              {fastingData?.isActive && fastingData?.expiresAt && (
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>Expires: {new Date(fastingData.expiresAt).toLocaleString()}</p>
              )}
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>{fastingData?.entries?.length || 0} student(s) registered</p>
            </div>
            {!fastingData?.isActive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  value={fastingFestivalInput}
                  onChange={e => setFastingFestivalInput(e.target.value)}
                  placeholder="Festival name e.g. Dashara Fasting, Roza"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  onClick={handleActivateFasting}
                  disabled={fastingActionLoading}
                  style={{ padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', color: '#ffffff', backgroundColor: '#d97706', border: 'none', cursor: 'pointer', opacity: fastingActionLoading ? 0.5 : 1 }}
                >
                  {fastingActionLoading ? 'Activating...' : '✅ Activate Fasting Register'}
                </button>
              </div>
            )}
            {fastingData?.isActive && (
              <button
                onClick={handleDeactivateFasting}
                disabled={fastingActionLoading}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', color: '#ffffff', backgroundColor: '#ef4444', border: 'none', cursor: 'pointer', opacity: fastingActionLoading ? 0.5 : 1 }}
              >
                {fastingActionLoading ? 'Deactivating...' : '🔒 Deactivate Register'}
              </button>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Students Fasting ({fastingData?.entries?.length || 0})</h3>
              <button
                onClick={handlePrintFasting}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
              >
                🖨️ Print List
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '384px', overflowY: 'auto' }}>
              {!fastingData?.entries?.length ? (
                <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: '#64748b' }}>No entries yet</p>
              ) : (
                fastingData.entries.map((entry, idx) => (
                  <div key={entry._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', width: '24px' }}>{idx + 1}.</span>
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{entry.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#d97706' }}>Room {entry.roomNumber}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <SuggestionBox />
      )}

      {/* Menu Edit Modal */}
      {editingDay && (
        <div
          onClick={() => setEditingDay(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(15,23,42,0.4)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '640px', padding: '32px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px' }}>Edit {editingDay} Menu</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
                <div key={mealType}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '8px' }}>{mealType}</label>
                  <textarea
                    value={draftMeals[mealType]}
                    onChange={(e) => setDraftMeals({ ...draftMeals, [mealType]: e.target.value })}
                    rows={3}
                    placeholder="One item per line"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditingDay(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '500', fontSize: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveMenu} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Poll Modal */}
      {deletingPollId && (
        <div
          onClick={() => setDeletingPollId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(15,23,42,0.4)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '440px', padding: '32px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertTriangle size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>Delete Poll?</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: '1.6' }}>This will permanently delete this poll and all its votes. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeletingPollId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '500', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDeletePoll} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: '600', color: '#ffffff', backgroundColor: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, UtensilsCrossed, Vote, Save, Plus, Trash2, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { menuService, pollService, ratingService, fastingService } from '../../services/api';

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
  // FASTING REGISTER FEATURE - admin state (remove this block to delete feature)
  const [fastingData, setFastingData] = useState(null);
  const [fastingFestivalInput, setFastingFestivalInput] = useState('');
  const [fastingActionLoading, setFastingActionLoading] = useState(false);
  // END FASTING REGISTER FEATURE - admin state

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user) {
        alert('❌ Error: Not logged in as admin.');
        setLoading(false);
        onBack?.();
        return;
      }
      // FASTING REGISTER FEATURE - load (remove this line to delete feature)
      const [menuData, pollData, graphData, fastingRes] = await Promise.all([
       menuService.getMenu(user?.hostelId || 'bh1'),
        pollService.getPolls(),
        ratingService.getWeeklyGraphData(),
        fastingService.getFasting(), // FASTING REGISTER FEATURE
      ]);
      setMenu(menuData.weeklyMenu || []);
      setPolls(pollData || []);
      setWeeklyGraphData(graphData || []);
      setFastingData(fastingRes || null); // FASTING REGISTER FEATURE
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Failed to load admin dashboard:\n${errorMsg}`);
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
    if (!pollDraft.question || options.length < 2) {
      alert('Enter a question and at least two options.');
      return;
    }
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
  // FASTING REGISTER FEATURE - admin handlers (remove this block to delete feature)
  const handleActivateFasting = async () => {
    if (!fastingFestivalInput.trim()) {
      alert('Please enter a festival name');
      return;
    }
    setFastingActionLoading(true);
    try {
      await fastingService.activate(fastingFestivalInput.trim());
      setFastingFestivalInput('');
      loadData();
      alert('✅ Fasting register activated!');
    } catch (error) {
      alert('Failed to activate: ' + (error.response?.data?.message || error.message));
    } finally {
      setFastingActionLoading(false);
    }
  };

  const handleDeactivateFasting = async () => {
    if (!window.confirm('Deactivate the fasting register? Students will no longer be able to submit.')) return;
    setFastingActionLoading(true);
    try {
      await fastingService.deactivate();
      loadData();
      alert('Fasting register deactivated.');
    } catch (error) {
      alert('Failed to deactivate: ' + (error.response?.data?.message || error.message));
    } finally {
      setFastingActionLoading(false);
    }
  };

  const handlePrintFasting = () => {
    const entries = fastingData?.entries || [];
    const festival = fastingData?.festivalName || 'Fasting Register';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>${festival}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p { color: #666; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f3f4f6; text-align: left; padding: 10px 14px; font-size: 13px; border: 1px solid #e5e7eb; }
        td { padding: 10px 14px; font-size: 13px; border: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
      </style>
      </head><body>
      <h1>${festival}</h1>
      <p>Total Students Fasting: ${entries.length} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString()}</p>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Room Number</th><th>Submitted At</th></tr></thead>
        <tbody>
          ${entries.map((e, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${e.name}</td>
              <td>${e.roomNumber}</td>
              <td>${new Date(e.submittedAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  // END FASTING REGISTER FEATURE - admin handlers

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
    } finally {
      setResettingRatings(false);
    }
  };

  const totalVotes = polls.reduce((sum, poll) => sum + poll.options.reduce((s, o) => s + o.votes, 0), 0);
  const activePollsCount = polls.filter(p => !p.isExpired).length;
  const totalRatings = weeklyGraphData.reduce((sum, day) => sum + day.voteCount, 0);

  const tabStyle = (tab) => ({
    borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
    color: activeTab === tab ? '#60A5FA' : '#64748B',
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center" style={{ color: '#64748B' }}>
        <div className="animate-pulse text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12" style={{ color: '#F1F5F9' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: '#F1F5F9' }}>
            Admin Dashboard
          </h2>
          <p style={{ color: '#64748B' }}>
            Managing <span className="font-semibold" style={{ color: '#94A3B8' }}>{hostel}</span>
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
          style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F', color: '#94A3B8' }}
        >
          <ChevronLeft size={18} /> Exit Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Active Polls', value: activePollsCount, color: '#3B82F6' },
          { label: 'Total Votes', value: totalVotes, color: '#8B5CF6' },
          { label: 'Ratings', value: totalRatings, color: '#10B981' },
          { label: 'Menu Days', value: menu.length, color: '#F59E0B' },
          { label: 'Hostel', value: hostel, color: '#38BDF8' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-5 rounded-2xl"
            style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>
              {label}
            </p>
            <p className="text-2xl font-black truncate" style={{ color: '#F1F5F9' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8" style={{ borderBottom: '1px solid #1E3A5F' }}>
        {[
          { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
          { id: 'polls', label: 'Polls', icon: Vote },
         { id: 'ratings', label: 'Ratings', icon: BarChart3 },
          // FASTING REGISTER FEATURE - tab (remove this line to delete feature)
          { id: 'fasting', label: 'Fasting', icon: UtensilsCrossed },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all"
            style={tabStyle(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
          <h3 className="text-xl font-bold mb-6" style={{ color: '#F1F5F9' }}>Weekly Menu</h3>
          <div className="space-y-3">
            {menu.map((day) => (
              <div
                key={day.day}
                className="p-4 rounded-xl flex items-center justify-between transition-all"
                style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F' }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold" style={{ color: '#F1F5F9' }}>{day.day}</h4>
                  <p className="text-sm truncate mt-0.5" style={{ color: '#64748B' }}>
                    Lunch: {day.menu.lunch}
                  </p>
                </div>
                <button
                  onClick={() => openMenuEditor(day)}
                  className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: '#3B82F6' }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Poll */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#F1F5F9' }}>Create Poll</h3>
            <div className="space-y-4">
              <input
                value={pollDraft.question}
                onChange={(e) => setPollDraft({ ...pollDraft, question: e.target.value })}
                placeholder="Poll question"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F', color: '#F1F5F9' }}
              />
              <textarea
                value={pollDraft.options}
                onChange={(e) => setPollDraft({ ...pollDraft, options: e.target.value })}
                placeholder="One option per line"
                rows={5}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F', color: '#F1F5F9' }}
              />
              <button
                onClick={createPoll}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Plus size={16} /> Create Poll
              </button>
            </div>
          </div>

          {/* Active Polls */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#F1F5F9' }}>
              Active Polls ({activePollsCount})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
              {polls.filter(p => !p.isExpired).length === 0 ? (
                <p className="text-center py-10" style={{ color: '#64748B' }}>No active polls yet</p>
              ) : (
                polls.filter(p => !p.isExpired).map((poll) => (
                  <div
                    key={poll._id}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm" style={{ color: '#F1F5F9' }}>{poll.question}</h4>
                      <button
                        onClick={() => setDeletingPollId(poll._id)}
                        className="p-1.5 rounded-lg transition-all ml-2"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {poll.options.map((option) => {
                        const total = poll.options.reduce((sum, item) => sum + item.votes, 0);
                        const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                        return (
                          <div key={option.text} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ backgroundColor: '#1E2A3A' }}>
                            <span style={{ color: '#94A3B8' }}>{option.text}</span>
                            <span className="font-semibold" style={{ color: '#60A5FA' }}>{option.votes} ({pct}%)</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#F1F5F9' }}>Weekly Ratings</h3>
            <div className="space-y-4">
              {weeklyGraphData.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium" style={{ color: '#94A3B8' }}>{day.day}</div>
                  <div className="flex-1">
                    <div className="rounded-full h-7 overflow-hidden" style={{ backgroundColor: '#111827' }}>
                      <div
                        className="h-full flex items-center justify-end pr-3 text-xs font-bold text-white rounded-full transition-all"
                        style={{
                          width: `${(day.avgRating / 5) * 100}%`,
                          backgroundColor: day.avgRating >= 4 ? '#10B981' : day.avgRating >= 3 ? '#F59E0B' : '#EF4444'
                        }}
                      >
                        {day.avgRating > 0 ? day.avgRating.toFixed(1) : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{day.voteCount} ratings</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{day.quality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {false && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
                <h4 className="font-bold mb-4" style={{ color: '#F1F5F9' }}>Top Items</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#10B981' }}>⭐ Highest Rated</p>
                    {topItems.highestRated?.slice(0, 2).map((item) => (
                      <p key={item.itemName} className="text-sm py-1" style={{ color: '#94A3B8' }}>
                        {item.itemName} <span className="font-bold" style={{ color: '#10B981' }}>{item.avgRating}</span>
                      </p>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #1E3A5F', paddingTop: '1rem' }}>
                    <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#EF4444' }}>📉 Lowest Rated</p>
                    {topItems.lowestRated?.slice(0, 2).map((item) => (
                      <p key={item.itemName} className="text-sm py-1" style={{ color: '#94A3B8' }}>
                        {item.itemName} <span className="font-bold" style={{ color: '#EF4444' }}>{item.avgRating}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleResetRatings}
              disabled={resettingRatings}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: '#EF4444' }}
            >
              <AlertTriangle size={16} />
              {resettingRatings ? 'Resetting...' : 'Reset All Ratings'}
            </button>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#60A5FA' }}>⏰ Auto Reset</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Ratings older than 30 days are removed automatically every day at midnight</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FASTING REGISTER FEATURE - Admin Tab UI                      */}
      {/* To remove: delete this entire block                          */}
      {/* ============================================================ */}
      {activeTab === 'fasting' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Activate / Deactivate Panel */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>Fasting Register Control</h3>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              Activate to let students register their fasting. Auto-deletes after 48 hours.
            </p>

            {/* Current Status */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F' }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#64748B' }}>Current Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: fastingData?.isActive ? '#4ade80' : '#ef4444',
                }} />
                <p className="font-bold" style={{ color: fastingData?.isActive ? '#4ade80' : '#f87171' }}>
                  {fastingData?.isActive ? `ACTIVE — ${fastingData.festivalName}` : 'INACTIVE'}
                </p>
              </div>
              {fastingData?.isActive && fastingData?.expiresAt && (
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  Expires: {new Date(fastingData.expiresAt).toLocaleString()}
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                {fastingData?.entries?.length || 0} student(s) registered
              </p>
            </div>

            {/* Activate Form */}
            {!fastingData?.isActive && (
              <div className="space-y-3">
                <input
                  value={fastingFestivalInput}
                  onChange={e => setFastingFestivalInput(e.target.value)}
                  placeholder="Festival name e.g. Dashara Fasting, Roza"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F', color: '#F1F5F9' }}
                />
                <button
                  onClick={handleActivateFasting}
                  disabled={fastingActionLoading}
                  className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  {fastingActionLoading ? 'Activating...' : '✅ Activate Fasting Register'}
                </button>
              </div>
            )}

            {/* Deactivate Button */}
            {fastingData?.isActive && (
              <button
                onClick={handleDeactivateFasting}
                disabled={fastingActionLoading}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#EF4444' }}
              >
                {fastingActionLoading ? 'Deactivating...' : '🔒 Deactivate Register'}
              </button>
            )}
          </div>

          {/* Entries List + Print */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
                Students Fasting ({fastingData?.entries?.length || 0})
              </h3>
              <button
                onClick={handlePrintFasting}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F', color: '#94A3B8' }}
              >
                🖨️ Print List
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {!fastingData?.entries?.length ? (
                <p className="text-center py-10 text-sm" style={{ color: '#64748B' }}>No entries yet</p>
              ) : (
                fastingData.entries.map((entry, idx) => (
                  <div
                    key={entry._id || idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F' }}
                  >
                    <span className="text-xs font-bold w-6" style={{ color: '#64748B' }}>{idx + 1}.</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: '#F1F5F9' }}>{entry.name}</span>
                    <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Room {entry.roomNumber}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* END FASTING REGISTER FEATURE - Admin Tab UI */}

      {/* Menu Edit Modal */}
      <AnimatePresence>
        {editingDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setEditingDay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl p-8 rounded-3xl"
              style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}
            >
              <h3 className="text-2xl font-black mb-6" style={{ color: '#F1F5F9' }}>
                Edit {editingDay} Menu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
                  <div key={mealType}>
                    <label className="block text-xs font-semibold uppercase mb-2" style={{ color: '#64748B' }}>
                      {mealType}
                    </label>
                    <textarea
                      value={draftMeals[mealType]}
                      onChange={(e) => setDraftMeals({ ...draftMeals, [mealType]: e.target.value })}
                      rows={3}
                      placeholder="One item per line"
                      className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
                      style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F', color: '#F1F5F9' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 py-3 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#111827', color: '#94A3B8', border: '1px solid #1E3A5F' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveMenu}
                  className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Poll Modal */}
      <AnimatePresence>
        {deletingPollId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeletingPollId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl"
              style={{ backgroundColor: '#1E2A3A', border: '1px solid #1E3A5F' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                <AlertTriangle size={22} color="#EF4444" />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: '#F1F5F9' }}>Delete Poll?</h3>
              <p className="text-sm mb-6" style={{ color: '#64748B' }}>
                This will permanently delete this poll and all its votes. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingPollId(null)}
                  className="flex-1 py-3 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#111827', color: '#94A3B8', border: '1px solid #1E3A5F' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePoll}
                  className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
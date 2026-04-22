import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const SuggestionPage = () => {
  const { user } = useContext(AuthContext);
  const [recipientType, setRecipientType] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const recipientOptions = [
    { value: 'mess_secretary', label: 'Mess Secretary', description: 'For mess-related issues and food quality feedback', icon: '🍽️' },
    { value: 'hostel_warden', label: `${user?.hostel} Warden`, description: 'For hostel facilities and maintenance issues', icon: '🏠' },
    { value: 'chief_warden', label: 'Chief Warden', description: 'For serious complaints or escalated issues', icon: '⭐' },
  ];

  const handleSubmit = async () => {
    if (!recipientType) return setError('Please select a recipient');
    if (!suggestionText.trim()) return setError('Please write your suggestion');
    setLoading(true);
    setError('');
    try {
      await api.post('/suggestions/submit', { suggestionText, recipientType });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-extrabold text-[#0f172a] mb-1">Suggestion Submitted</h2>
          <p className="text-sm text-[#64748b] mb-0.5">{user?.hostel}</p>
          <p className="text-xs text-[#94a3b8] mb-6">{new Date().toLocaleDateString('en-IN')}</p>
          <button
            onClick={() => { setSubmitted(false); setSuggestionText(''); setRecipientType(''); }}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors cursor-pointer"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-xl mx-auto">

        {/* Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-[#2563eb]" />

          <div className="p-6 md:p-8">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight mb-1">
                📬 Suggestion Box
              </h2>
              <p className="text-xs text-[#94a3b8]">
                {user?.hostel} · {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Recipient */}
            <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">
              Send to
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              {recipientOptions.map(opt => {
                const isActive = recipientType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setRecipientType(opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left border transition-colors cursor-pointer
                      ${isActive
                        ? 'bg-[#eff6ff] border-[#2563eb]'
                        : 'bg-white border-[#e2e8f0] hover:border-[#bfdbfe]'
                      }`}
                  >
                    <span className="text-xl shrink-0">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isActive ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">{opt.description}</p>
                    </div>
                    {isActive && (
                      <span className="text-[#2563eb] font-bold shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">
              Your Message
            </p>
            <textarea
              value={suggestionText}
              onChange={e => setSuggestionText(e.target.value)}
              placeholder="Write your suggestion or complaint here..."
              rows={5}
              className="w-full rounded-xl p-4 text-sm resize-none outline-none border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:border-[#2563eb] transition-colors"
            />

            {/* Error */}
            {error && (
              <p className="text-[#dc2626] text-xs font-semibold mt-2">{error}</p>
            )}

            {/* Anonymous notice */}
            <p className="text-xs text-[#94a3b8] mt-3 mb-5">
              🔒 Your identity is completely anonymous to the recipient.
            </p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-colors
                ${loading
                  ? 'bg-[#93c5fd] cursor-not-allowed'
                  : 'bg-[#2563eb] hover:bg-[#1d4ed8] cursor-pointer'
                }`}
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionPage;
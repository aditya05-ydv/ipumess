import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const SuggestionBox = () => {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/suggestions/mess/${user?.hostel}`);
      setSuggestions(res.data);
      setFetched(true);
    } catch (err) {
      setError('Failed to load suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>📬 Mess Suggestions</h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Only suggestions sent to Mess Secretary are shown here</p>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', backgroundColor: loading ? '#f8fafc' : '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, flexShrink: 0 }}
        >
          {loading ? 'Loading...' : fetched ? '🔄 Refresh' : 'View Suggestions'}
        </button>
      </div>

      {/* Error */}
      {error && <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '16px' }}>{error}</p>}

      {/* Not fetched yet */}
      {!fetched && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', borderRadius: '10px', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '28px', marginBottom: '8px' }}>📭</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Click "View Suggestions" to load</p>
        </div>
      )}

      {/* Suggestions list */}
      {fetched && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '500', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user?.hostel}</span>
          </div>

          {suggestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', borderRadius: '10px', border: '1px dashed #e2e8f0', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>✅</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No mess suggestions yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {suggestions.map((s, i) => (
                <div
                  key={s._id}
                  style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6', margin: '0 0 12px' }}>{s.suggestionText}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e2e8f0', color: '#475569' }}>{s.hostel}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionBox;
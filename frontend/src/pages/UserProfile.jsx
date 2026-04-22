import { ChevronLeft, CheckCircle2, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfile = ({ onBack, onAdminSwitch }) => {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '672px', margin: '0 auto', padding: '48px 24px', backgroundColor: '#f8fafc' }}>

      {/* Back Button */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '40px', borderRadius: '14px', textAlign: 'center' }}>

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
          <div style={{ width: '128px', height: '128px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '36px', fontWeight: '900' }}>
            {(user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '36px', height: '36px', backgroundColor: '#f97316', border: '4px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Name & Role */}
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
          {user?.name || 'Student'}
        </h2>
        <p style={{ color: '#64748b', fontWeight: '500', margin: '0 0 32px' }}>
          {user?.role === 'admin' ? 'Hostel Admin' : 'Hostel Resident • Active User'}
        </p>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
              Room No
            </p>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0' }}>
              {user?.roomNumber || 'Admin'}
            </p>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
              Hostel
            </p>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0' }}>
              {user?.hostel || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onAdminSwitch}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#2563eb', border: 'none', color: '#ffffff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <BarChart3 size={19} /> Go to Admin Portal
          </button>

          <button
            onClick={logout}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <LogOut size={19} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
};

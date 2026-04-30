import { ArrowRight, Users, Star, TrendingUp, Shield, Clock, Bell } from 'lucide-react';

export const HostelSlider = ({ onEnterPortal }) => {
  const stats = [
    { label: 'Active Students', value: '700+', icon: Users },
    { label: 'Avg Rating', value: '4.8★', icon: Star },
    { label: 'Meals Rated', value: '2.4k', icon: TrendingUp },
  ];

  const features = [
    { icon: Star, title: 'Daily Ratings', desc: 'Rate every meal in real-time' },
    { icon: Bell, title: 'Live Polls', desc: 'Vote on weekly menu decisions' },
    { icon: Shield, title: 'Transparent', desc: 'Results visible to everyone' },
    { icon: Clock, title: 'Weekly Menus', desc: 'Plan your meals in advance' },
  ];

  return (
    <section style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>

        {/* University Tag */}
        {/* University Tag */}
<div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
  <img
    src="/ggsipu-logo.jpeg"
    alt="GGSIPU Logo"
    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
  />
  <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '0.02em', textAlign: 'center' }}>
    Guru Gobind Singh Indraprastha University
  </p>
    <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
        Hostel Mess Management System · Dwarka
    </p>
</div>

        {/* Heading */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontWeight: '900', lineHeight: '1.1', letterSpacing: '-2px', marginBottom: '20px', color: '#0f172a' }}>
            <span style={{ fontSize: 'clamp(36px, 8vw, 72px)', display: 'block' }}>Your Mess.</span>
            <span style={{ fontSize: 'clamp(36px, 8vw, 72px)', display: 'block', color: '#2563eb' }}>Your Voice.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>
            Rate meals, vote on menus, and help improve hostel dining — all in one place.
          </p>
        </div>

        {/* CTA Button */}
        <div style={{ marginBottom: '48px' }}>
          <button
            onClick={onEnterPortal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '10px', fontWeight: '700', fontSize: '16px', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
          >
            Enter Mess Portal
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 8px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <Icon size={16} color="#2563eb" style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0', textAlign: 'center' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{ padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
                <Icon size={15} color="#2563eb" />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0' }}>{title}</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0', lineHeight: '1.5' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          ✓ Secure Login &nbsp;•&nbsp; 700+ Active Students &nbsp;•&nbsp; Real-time Feedback
        </p>

      </div>
    </section>
  );
};
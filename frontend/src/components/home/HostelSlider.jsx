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
    <section style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>

        {/* Badge */}
        

        {/* Heading */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1.5px', marginBottom: '16px', color: '#0f172a' }}>
            Your Hostel Dining,{' '}
            <span style={{ color: '#2563eb' }}>Reimagined.</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: '1.7' }}>
            A student-driven platform for transparent meal ratings, live polls,
            and weekly menu planning — all in one place.
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button
            onClick={onEnterPortal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
          >
            Enter Mess Portal
            <ArrowRight size={17} />
          </button>

          
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <Icon size={16} color="#2563eb" style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0', textAlign: 'center' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{ padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
                <Icon size={15} color="#2563eb" />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0' }}>{title}</p>
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
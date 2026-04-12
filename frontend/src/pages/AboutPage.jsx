import { motion } from 'motion/react';
import { ChevronLeft, Heart, BarChart3, Users, ExternalLink, Code2, Sparkles } from 'lucide-react';

export const AboutPage = ({ onBack }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1017', paddingTop: '96px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>

        {/* Back */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginBottom: '40px', padding: '8px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <ChevronLeft size={15} /> Back
        </motion.button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block', marginBottom: '20px',
            padding: '4px 14px', borderRadius: '20px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            fontSize: '10px', fontWeight: 700, color: '#818cf8',
            fontFamily: '"DM Mono", monospace', letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            About the Project
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900,
            color: '#f1f5f9', fontFamily: '"DM Sans", sans-serif',
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px',
          }}>
            Better Food.<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Better Living.
            </span>
          </h1>

          <p style={{
            fontSize: '16px', color: '#64748b', lineHeight: 1.75,
            fontFamily: '"DM Sans", sans-serif', maxWidth: '580px',
          }}>
            Smart Mess System connects students with mess management through real-time feedback.
            Quality meals and student satisfaction drive academic excellence.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '40px' }}
        >
          {[
            { icon: <Heart size={18} />, title: 'Quality Focus', desc: 'Rate every meal and help maintain high food quality standards.', accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
            { icon: <BarChart3 size={18} />, title: 'Real Analytics', desc: 'View meal trends and ratings in an interactive dashboard.', accent: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
            { icon: <Users size={18} />, title: 'Community', desc: 'Student voices shaping hostel dining experiences together.', accent: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
          ].map(({ icon, title, desc, accent, bg, border }) => (
            <div key={title} style={{
              padding: '20px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
              transition: 'border-color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = border}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '9px', marginBottom: '14px',
                background: bg, border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: '"DM Sans", sans-serif', marginBottom: '6px' }}>
                {title}
              </h3>
              <p style={{ fontSize: '13px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Developer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'linear-gradient(135deg, #161b27 0%, #111520 100%)',
            boxShadow: '0 8px 40px rgba(99,102,241,0.08)',
          }}
        >
          {/* Card top accent */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #4f46e5 0%, #a78bfa 50%, #6366f1 100%)' }} />

          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <Code2 size={14} color="#6366f1" />
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', fontFamily: '"DM Mono", monospace', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Created By
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '96px', height: '96px', borderRadius: '20px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 900, color: '#fff',
                  fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.02em',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                  border: '2px solid rgba(99,102,241,0.4)',
                }}>
                  AY
                </div>
                {/* Online dot */}
                <div style={{
                  position: 'absolute', bottom: '6px', right: '6px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: '#34d399', border: '2px solid #111520',
                  boxShadow: '0 0 8px rgba(52,211,153,0.6)',
                }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h3 style={{
                    fontSize: '22px', fontWeight: 800, color: '#f1f5f9',
                    fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.02em',
                  }}>
                    Aditya Yadav 
                  </h3>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: '5px',
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                    fontSize: '9px', fontWeight: 700, color: '#34d399',
                    fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    <Sparkles size={9} /> Open to Work
                  </div>
                </div>
                <p style={{
                  fontSize: '13px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif',
                  lineHeight: 1.7, marginBottom: '20px', maxWidth: '420px',
                }}>
                   USICT 2023-2027🎓
                </p>

                <p style={{
                  fontSize: '12px', color: '#6366f1', fontFamily: '"DM Mono", monospace',
                  letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase',
                }}>
                  Full Stack Developer
                </p>

                <p style={{
                  fontSize: '13px', color: '#4b5563', fontFamily: '"DM Sans", sans-serif',
                  lineHeight: 1.7, marginBottom: '20px', maxWidth: '420px',
                }}>
                  This platform comes from real hostel experience — the frustration, the jokes, the daily struggles. 
Smart Mess turns those experiences into a system where students can rate, vote, and actually influence 
what they eat.
                </p>

                {/* Tags */}
                {/* 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {['React', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind'].map(tag => (
                    <span key={tag} style={{
                      padding: '3px 10px', borderRadius: '5px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '10px', fontWeight: 600, color: '#64748b',
                      fontFamily: '"DM Mono", monospace',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div> */}

                <a
                  href="https://www.linkedin.com/in/adityayadav25/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    color: '#fff', fontSize: '13px', fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif', textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.45)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'}
                >
                  <ExternalLink size={13} />
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
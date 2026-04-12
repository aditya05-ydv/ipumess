import { motion } from 'motion/react';
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
    <section
      className="min-h-screen flex items-center justify-center px-6 py-20"
      style={{ backgroundColor: '#0A0F1E' }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60A5FA'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            Hostel Mess Management System
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4"
            style={{ color: '#F1F5F9' }}
          >
            Your Hostel Dining,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Reimagined.
            </span>
          </h1>
          <p
            className="text-sm sm:text-base max-w-md mx-auto leading-relaxed"
            style={{ color: '#64748B' }}
          >
            A student-driven platform for transparent meal ratings, live polls,
            and weekly menu planning — all in one place.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(59,130,246,0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnterPortal}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white transition-all"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Enter Mess Portal
            <ArrowRight size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/about'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid #1E3A5F',
              color: '#94A3B8'
            }}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-4 mx-auto"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center py-4 px-2 rounded-2xl"
              style={{ backgroundColor: '#111827', border: '1px solid #1E3A5F' }}
            >
              <Icon size={15} color="#3B82F6" className="mb-2" />
              <p className="text-base font-black" style={{ color: '#F1F5F9' }}>{value}</p>
              <p className="text-xs mt-0.5 text-center leading-tight" style={{ color: '#475569' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mx-auto"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-2xl flex flex-col gap-2 text-left"
              style={{ backgroundColor: '#0D1526', border: '1px solid #1E3A5F' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
              >
                <Icon size={15} color="#3B82F6" />
              </div>
              <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Trust */}
        <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
          ✓ Secure Login &nbsp;•&nbsp; 700+ Active Students &nbsp;•&nbsp; Real-time Feedback
        </p>
      </motion.div>
    </section>
  );
};
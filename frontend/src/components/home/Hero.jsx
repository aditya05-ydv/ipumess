import { motion } from 'motion/react';
import { ChevronRight, Star, UtensilsCrossed, TrendingUp, Users } from 'lucide-react';

export const Hero = ({ onStart }) => {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: '#0A0F1E' }}
    >
      {/* Background Effects */}
     {/* Background Effects */}
<div
  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl pointer-events-none"
  style={{
    backgroundColor: '#3B82F6',
    width: '600px',
    height: '600px',
    opacity: 0.2,
    transform: 'translateX(-50%)'
  }}
/>
<div
  className="absolute bottom-0 right-0 rounded-full blur-3xl pointer-events-none"
  style={{
    backgroundColor: '#38BDF8',
    width: '400px',
    height: '400px',
    opacity: 0.1
  }}
/>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-3xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{
            backgroundColor: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#60A5FA'
          }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Hostel Mess Rating System
        </motion.div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          <span style={{ color: '#F1F5F9' }}>Better Food.</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Better Living.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
          A student-led initiative to improve mess quality through transparent
          daily voting and feedback.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Enter Mess Portal
            <ChevronRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-base transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid #1E3A5F',
              color: '#94A3B8'
            }}
          >
            Learn More
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-14">
          {[
            { label: 'Active Students', value: '700+', icon: Users },
            { label: 'Avg Rating', value: '4.8★', icon: Star },
            { label: 'Meals Rated', value: '2.4k', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Cards — Desktop only */}
      <div className="hidden lg:block">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-[10%] p-4 rounded-2xl flex items-center gap-3"
          style={{
            backgroundColor: '#1E2A3A',
            border: '1px solid #1E3A5F',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34D399' }}
          >
            <Star size={18} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#64748B' }}>Today's Rating</p>
            <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>4.8 / 5.0</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-[10%] p-4 rounded-2xl flex items-center gap-3"
          style={{
            backgroundColor: '#1E2A3A',
            border: '1px solid #1E3A5F',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}
          >
            <UtensilsCrossed size={18} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#64748B' }}>Next Meal</p>
            <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Dinner @ 8:00 PM</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0A0F1E, transparent)'
        }}
      />
    </div>
  );
};
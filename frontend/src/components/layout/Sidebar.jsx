import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, UtensilsCrossed, Info, LogIn, BarChart3, MessageSquare, Settings, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const Sidebar = ({ currentView, onNavigate, onSignIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, view: 'home', action: () => { onNavigate('home'); setIsOpen(false); } },
    { label: 'Menu', icon: UtensilsCrossed, view: 'menu', action: () => { onNavigate('menu'); setIsOpen(false); } },
    { label: 'About', icon: Info, view: 'about', action: () => { onNavigate('about'); setIsOpen(false); } },
  ];

  const userNavItems = [
    { label: 'Polls', icon: MessageSquare, view: 'polls', action: () => { onNavigate('polls'); setIsOpen(false); } },
    { label: 'Results', icon: BarChart3, view: 'results', action: () => { onNavigate('results'); setIsOpen(false); } },
    { label: 'Profile', icon: Settings, view: 'profile', action: () => { onNavigate('profile'); setIsOpen(false); } },
  ];

  const NavButton = ({ item }) => (
    <button
      onClick={item.action}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
        currentView === item.view
          ? 'text-blue-400'
          : 'text-slate-400 hover:text-white'
      )}
      style={currentView === item.view ? {
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderLeft: '2px solid #3B82F6'
      } : {
        borderLeft: '2px solid transparent'
      }}
    >
      <item.icon size={18} />
      <span>{item.label}</span>
    </button>
  );

  return (
    <div>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: '#0D1526', borderColor: '#1E3A5F' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

          {/* Left — Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition lg:hidden text-slate-400 hover:text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Utensils size={16} color="white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold text-sm leading-tight">Smart Mess</p>
                <p className="text-slate-500 text-xs">Student Initiative</p>
              </div>
            </div>
          </div>

          {/* Right — Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">{user.name || 'Student'}</p>
                  <p className="text-slate-500 text-xs">{user.hostel || ''}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-slate-400 hover:text-white"
                  style={{ border: '1px solid #1E3A5F' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ backgroundColor: '#3B82F6' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="fixed left-0 top-0 h-screen w-64 z-50 pt-20 lg:hidden flex flex-col"
        style={{ backgroundColor: '#0D1526', borderRight: '1px solid #1E3A5F' }}
      >
        <nav className="px-3 space-y-1 flex-1">
          {navItems.map((item) => <NavButton key={item.label} item={item} />)}

          {user && (
            <>
              <div className="my-4" style={{ borderTop: '1px solid #1E3A5F' }} />
              <p className="px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                My Account
              </p>
              {userNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </>
          )}
        </nav>

        {!user && (
          <div className="p-4" style={{ borderTop: '1px solid #1E3A5F' }}>
            <button
              onClick={() => { onNavigate('login'); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <LogIn size={16} />
              Sign In
            </button>
          </div>
        )}
      </motion.aside>

      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex flex-col fixed top-16 left-0 w-64 h-screen z-40 pt-6 px-3"
        style={{
          backgroundColor: '#0D1526',
          borderRight: '1px solid #1E3A5F'
        }}
      >
        <div className="space-y-1 flex-1">
          {navItems.map((item) => <NavButton key={item.label} item={item} />)}

          {user && (
            <>
              <div className="my-4" style={{ borderTop: '1px solid #1E3A5F' }} />
              <p className="px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                My Account
              </p>
              {userNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </>
          )}
        </div>

        {!user && (
          <div className="pb-8 px-1">
            <button
              onClick={() => onNavigate('login')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <LogIn size={16} />
              Sign In
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
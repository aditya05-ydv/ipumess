import { Home, UtensilsCrossed, Info, BarChart3, Vote, User, ChevronLeft, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar = ({ currentView, setView, hostelName, onBack, onMenuClick }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, onClick: () => setView('home') },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, onClick: () => onMenuClick?.() },
    { id: 'about', label: 'About', icon: Info, onClick: () => setView('about') },
  ];

  const actionItems = [
    { id: 'stats', label: 'Analytics', icon: BarChart3, onClick: () => setView('stats') },
    { id: 'polls', label: 'Polls', icon: Vote, onClick: () => setView('polls') },
    { id: 'profile', label: 'Profile', icon: User, onClick: () => setView('profile') },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: '#0D1526', borderColor: '#1E3A5F' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left — Logo or Back */}
          <div className="flex items-center gap-6">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <>
                {/* Logo */}
                <div className="flex items-center gap-2 mr-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#3B82F6' }}>
                    <Utensils size={16} color="white" />
                  </div>
                  <span className="font-bold text-white text-sm hidden sm:block">
                    Smart Mess
                  </span>
                </div>

                {/* Nav Links */}
                <div className="hidden sm:flex items-center gap-1">
                  {navItems.map(({ id, label, icon: Icon, onClick }) => (
                    <button
                      key={id}
                      onClick={onClick}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        currentView === id
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                      style={currentView === id ? {
                        backgroundColor: 'rgba(59,130,246,0.15)',
                        color: '#60A5FA'
                      } : {}}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center — Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-sm font-semibold text-slate-300 tracking-wide">
              {currentView === 'admin' ? 'Admin Portal' : (hostelName || '')}
            </span>
          </div>

          {/* Right — Action Icons */}
          <div className="flex items-center gap-1">
            {actionItems.map(({ id, label, icon: Icon, onClick }) => (
              <button
                key={id}
                onClick={onClick}
                title={label}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  currentView === id
                    ? "text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                style={currentView === id ? {
                  backgroundColor: 'rgba(59,130,246,0.15)'
                } : {}}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
          {!onBack && navItems.map(({ id, label, icon: Icon, onClick }) => (
            <button
              key={id}
              onClick={onClick}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                currentView === id
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-white"
              )}
              style={currentView === id ? {
                backgroundColor: 'rgba(59,130,246,0.15)'
              } : {}}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
};
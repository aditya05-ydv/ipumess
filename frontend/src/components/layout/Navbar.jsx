import { Home, UtensilsCrossed, Info, BarChart3, Vote, User, ChevronLeft, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar = ({ currentView, setView, hostelName, onBack, onMenuClick }) => {
  const navItems = [
    { id: 'home',  label: 'Home',  icon: Home,           onClick: () => setView('home') },
    { id: 'menu',  label: 'Menu',  icon: UtensilsCrossed, onClick: () => onMenuClick?.() },
    { id: 'about', label: 'About', icon: Info,            onClick: () => setView('about') },
  ];

  const actionItems = [
    { id: 'stats',   label: 'Analytics', icon: BarChart3, onClick: () => setView('stats') },
    { id: 'polls',   label: 'Polls',     icon: Vote,      onClick: () => setView('polls') },
    { id: 'profile', label: 'Profile',   icon: User,      onClick: () => setView('profile') },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b-2 border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left — Logo or Back */}
          <div className="flex items-center gap-5">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-[#64748b] hover:text-[#0f172a]"
              >
                <ChevronLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <>
                {/* Logo */}
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
                    <Utensils size={15} color="white" />
                  </div>
                  <span className="font-bold text-[#0f172a] text-sm hidden sm:block">
                    Smart Mess
                  </span>
                </div>

                {/* Nav Links */}
                <div className="hidden sm:flex items-center gap-0.5">
                  {navItems.map(({ id, label, icon: Icon, onClick }) => (
                    <button
                      key={id}
                      onClick={onClick}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                        currentView === id
                          ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                          : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                      )}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center — Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xs font-semibold text-[#94a3b8] tracking-widest uppercase">
              {currentView === 'admin' ? 'Admin Portal' : (hostelName || '')}
            </span>
          </div>

          {/* Right — Action Icons */}
          <div className="flex items-center gap-0.5">
            {actionItems.map(({ id, label, icon: Icon, onClick }) => (
              <button
                key={id}
                onClick={onClick}
                title={label}
                className={cn(
                  'p-2 rounded-lg',
                  currentView === id
                    ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                    : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                )}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>

        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden flex items-center gap-1 pb-2.5 overflow-x-auto no-scrollbar">
          {!onBack && navItems.map(({ id, label, icon: Icon, onClick }) => (
            <button
              key={id}
              onClick={onClick}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
                currentView === id
                  ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
}
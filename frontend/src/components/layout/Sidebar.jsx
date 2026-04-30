import { useState } from 'react';
import { Menu, X, Home, UtensilsCrossed, Info, LogIn, BarChart3, MessageSquare, Settings, Utensils, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';

export const Sidebar = ({ currentView, onNavigate, onSignIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, clearNotification } = useNotifications();

  const handleNavigate = (view) => {
    if (view === 'menu') clearNotification('menu');
    if (view === 'polls') clearNotification('polls');
    if (view === 'results') clearNotification('results');
    onNavigate(view);
    setIsOpen(false);
  };

  const RedDot = () => (
    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
  );

  const navItems = [
    { label: 'Home', icon: Home, view: 'home' },
    { label: 'Menu', icon: UtensilsCrossed, view: 'menu', hasNotification: notifications.menu },
    { label: 'About', icon: Info, view: 'about' },
  ];

  const userNavItems = [
    { label: 'Polls', icon: MessageSquare, view: 'polls', hasNotification: notifications.polls },
    { label: 'Results', icon: BarChart3, view: 'results', hasNotification: notifications.results },
    { label: 'Suggestion', icon: Lightbulb, view: 'suggestions' },
    { label: 'Profile', icon: Settings, view: 'profile' },
  ];

  const NavButton = ({ item }) => (
    <button
      onClick={() => handleNavigate(item.view)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
        currentView === item.view
          ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
          : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
      )}
    >
      <item.icon size={16} />
      <span>{item.label}</span>
      {item.hasNotification && <RedDot />}
    </button>
  );

  return (
    <div>
      {/* ── TOPBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#e2e8f0]">
        <div className="flex items-center justify-between h-[57px]">

          {/* ── MOBILE TOPBAR ── */}
          <div className="flex lg:hidden items-center gap-3 px-4 h-full flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex-shrink-0"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                <Utensils size={13} color="white" />
              </div>
              <p className="text-[#0f172a] font-bold text-sm">Smart Mess</p>
            </div>

            {/* Mobile Auth */}
            <div className="ml-auto">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[#0f172a] text-xs font-semibold leading-tight">{user.name || 'Student'}</p>
                    <p className="text-[#94a3b8] text-[10px]">{user.hostel || ''}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2563eb]"
                >
                  <LogIn size={13} />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* ── DESKTOP TOPBAR ── */}
          <div className="hidden lg:flex items-center justify-between w-full h-full">
            <div className="w-[240px] flex-shrink-0 flex items-center gap-2.5 px-4 h-full border-r-2 border-[#e2e8f0]">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                <Utensils size={15} color="white" />
              </div>
              <div className="min-w-0">
                <p className="text-[#0f172a] font-bold text-sm leading-tight whitespace-nowrap">Smart Mess</p>
                <p className="text-[#94a3b8] text-xs whitespace-nowrap">Student Initiative</p>
              </div>
            </div>

            {/* Desktop Auth */}
            <div className="flex items-center gap-3 px-6">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[#0f172a] text-sm font-semibold">{user.name || 'Student'}</p>
                    <p className="text-[#94a3b8] text-xs">{user.hostel || ''}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm font-medium px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                >
                  <LogIn size={15} />
                  Sign In
                </button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* ── MOBILE OVERLAY ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 lg:hidden bg-[#0f172a]/20"
        />
      )}

      {/* ── MOBILE SIDEBAR ── */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 z-50 pt-[57px] flex flex-col bg-white border-r-2 border-[#e2e8f0] lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => <NavButton key={item.label} item={item} />)}

          {user && (
            <>
              <div className="my-3 border-t border-[#e2e8f0]" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
                My Account
              </p>
              {userNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </>
          )}
        </nav>

        {!user && (
          <div className="p-3 border-t border-[#e2e8f0]">
            <button
              onClick={() => { onNavigate('login'); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-medium bg-[#2563eb]"
            >
              <LogIn size={15} />
              Sign In
            </button>
          </div>
        )}
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="hidden lg:flex flex-col fixed top-[57px] left-0 w-[240px] h-screen z-40 bg-white border-r-2 border-[#e2e8f0]">
        <div className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => <NavButton key={item.label} item={item} />)}

          {user && (
            <>
              <div className="my-3 border-t border-[#e2e8f0]" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
                My Account
              </p>
              {userNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </>
          )}
        </div>

        {!user && (
          <div className="p-3 border-t border-[#e2e8f0]">
            <button
              onClick={() => onNavigate('login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-medium bg-[#2563eb]"
            >
              <LogIn size={15} />
              Sign In
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
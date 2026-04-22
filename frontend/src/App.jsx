import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { HostelSlider } from './components/home/HostelSlider';
import { MenuTable } from './components/menu/MenuTable';
import { DayDetail } from './components/menu/DayDetail';
import { Polls } from './components/polls/Polls';
import { LoginModal } from './components/auth/LoginModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AboutPage } from './pages/AboutPage';
import { UserProfile } from './pages/UserProfile';
import { LoginPage } from './pages/LoginPage';
import ResultsPage from './pages/ResultsPage';
import SuggestionPage from './pages/SuggestionPage';
import { HOSTELS } from './data/menuData';

const AppContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);

  useEffect(() => {
    if (user?.hostelId) setSelectedHostel(user.hostelId);
    if (user?.role === 'admin' && showAdminLogin) {
      setShowAdminLogin(false);
      navigate('/admin');
    }
  }, [user?.hostelId, user?.role, showAdminLogin]);

  const requireAuth = (path) => {
    if (!user) {
      navigate('/login', { state: { returnTo: path } });
      return false;
    }
    return true;
  };

  const handleNavigate = (view) => {
    if (view === 'home') { navigate('/'); return; }
    if (view === 'menu') {
      setSelectedHostel(user?.hostelId || selectedHostel || 'bh1');
      navigate('/menu'); return;
    }
    if (view === 'admin') { setShowAdminLogin(true); return; }
    if (['polls', 'results', 'suggestions', 'profile'].includes(view)) {
      if (!requireAuth('/' + view)) return;
    }
    navigate('/' + view);
  };

  const handleEnterPortal = () => {
    setSelectedHostel(user?.hostelId || selectedHostel || 'bh1');
    navigate('/menu');
  };

  const showFooter = location.pathname !== '/' && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        currentView={location.pathname.replace('/', '') || 'home'}
        onNavigate={handleNavigate}
        onSignIn={() => navigate('/login', { state: { returnTo: location.pathname } })}
      />

      {/* 
        Mobile:  only top padding (57px for topbar), no left padding
        Desktop: top padding + left padding for sidebar (240px = w-60)
      */}
      <main className="pt-[57px] lg:pl-[240px]">
        <Routes>
          <Route path="/" element={<HostelSlider onEnterPortal={handleEnterPortal} />} />

          <Route path="/about" element={<AboutPage onBack={() => navigate('/')} />} />

          <Route path="/menu" element={
            <MenuTable
              hostelId={selectedHostel || user?.hostelId || 'bh1'}
              onDayClick={(day) => setSelectedDay(day)}
              onSelectHostel={setSelectedHostel}
              onSignInClick={() => navigate('/login', { state: { returnTo: '/menu' } })}
            />
          } />

          <Route path="/polls" element={
            user
              ? <Polls onVote={() => navigate('/login', { state: { returnTo: '/polls' } })} onBack={() => navigate('/menu')} />
              : <LoginPage onBack={() => navigate('/')} onSuccess={() => navigate('/polls')} initialHostel={selectedHostel || 'bh1'} />
          } />

          <Route path="/results" element={
            user ? <ResultsPage /> : <LoginPage onBack={() => navigate('/')} onSuccess={() => navigate('/results')} initialHostel={selectedHostel || 'bh1'} />
          } />

          <Route path="/suggestions" element={
            user ? <SuggestionPage /> : <LoginPage onBack={() => navigate('/')} onSuccess={() => navigate('/suggestions')} initialHostel={selectedHostel || 'bh1'} />
          } />

          <Route path="/profile" element={
            user
              ? <UserProfile onBack={() => navigate('/menu')} onAdminSwitch={() => setShowAdminLogin(true)} />
              : <LoginPage onBack={() => navigate('/')} onSuccess={() => navigate('/profile')} initialHostel={selectedHostel || 'bh1'} />
          } />

          <Route path="/admin" element={
            user?.role === 'admin'
              ? <AdminPortal onBack={() => navigate('/profile', { replace: true })} />
              : <LoginPage onBack={() => navigate('/')} onSuccess={() => navigate('/admin')} initialHostel={selectedHostel || 'bh1'} />
          } />

          <Route path="/login" element={
            <LoginPage
              onBack={() => navigate(location.state?.returnTo || '/')}
              onSuccess={() => navigate(location.state?.returnTo || '/menu')}
              initialHostel={selectedHostel || 'bh1'}
            />
          } />

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
              <p className="text-6xl font-black text-[#e2e8f0] mb-4">404</p>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Page not found</h2>
              <p className="text-sm text-[#64748b] mb-6">The page you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-lg bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8]"
              >
                Go Home
              </button>
            </div>
          } />
        </Routes>
      </main>

      {selectedDay && (
        <DayDetail
          dayMenu={selectedDay}
          hostelId={selectedHostel || user?.hostelId || 'bh1'}
          onClose={() => setSelectedDay(null)}
          onRequireLogin={(payload) => {
            setPendingRating(payload);
            navigate('/login', { state: { returnTo: '/menu' } });
            setSelectedDay(null);
          }}
          pendingRating={pendingRating}
          onPendingRatingHandled={() => setPendingRating(null)}
        />
      )}

      {showAdminLogin && (
        <LoginModal onClose={() => setShowAdminLogin(false)} mode="admin" />
      )}

      <Footer show={showFooter} onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
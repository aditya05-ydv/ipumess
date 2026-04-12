import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { HOSTELS } from './data/menuData';
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

const AppContent = () => {
  const [view, setView] = useState('home');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  const [loginReturn, setLoginReturn] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.hostelId) {
      setSelectedHostel(user.hostelId);
    }
    if (user?.role === 'admin' && showAdminLogin) {
      setShowAdminLogin(false);
      setView('admin');
    }
  }, [user?.hostelId, user?.role, showAdminLogin]);

  const handleEnterPortal = () => {
    setSelectedHostel(user?.hostelId || selectedHostel || 'bh1');
    setView('menu');
  };

  const handleMenuClick = () => {
    setSelectedHostel(user?.hostelId || selectedHostel || 'bh1');
    setView('menu');
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const resetToHome = () => {
    setView('home');
    setSelectedHostel(null);
    setSelectedDay(null);
    setShowAdminLogin(false);
    setLoginReturn(null);
    setPendingRating(null);
  };

  const openLoginPage = (returnState = null) => {
    setLoginReturn(returnState);
    setView('login');
  };

  const guardedSetView = (nextView) => {
    if ((nextView === 'polls' || nextView === 'results' || nextView === 'profile') && !user) {
      openLoginPage({ returnView: nextView });
      return;
    }
    if (nextView === 'admin') {
      setShowAdminLogin(true);
      return;
    }
    setView(nextView);
  };

  const handleRequireLoginForRating = (ratingPayload) => {
    setPendingRating(ratingPayload);
    openLoginPage({
      returnView: 'menu',
      day: selectedDay,
      hostelId: selectedHostel,
    });
    setSelectedDay(null);
  };

  const handleLoginSuccess = () => {
    if (loginReturn?.hostelId && loginReturn?.day) {
      setSelectedHostel(loginReturn.hostelId);
      setSelectedDay(loginReturn.day);
      setView('menu');
      setLoginReturn(null);
      return;
    }

    setView(loginReturn?.returnView || 'menu');
    setLoginReturn(null);
  };

  const currentHostel = HOSTELS.find((hostel) => hostel.id === selectedHostel);
  const showFooter = view !== 'home' && view !== 'login' && !(!selectedHostel && view === 'menu');

  return _jsxs('div', {
   className: 'min-h-screen selection:bg-blue-900 selection:text-blue-300',
style: { backgroundColor: '#0A0F1E' },
    children: [
      _jsx(Sidebar, {
        currentView: view,
        onNavigate: (nextView) => {
          if (nextView === 'home') {
            resetToHome();
          } else if (nextView === 'menu') {
            setSelectedHostel(user?.hostelId || selectedHostel || 'bh1');
            guardedSetView('menu');
          } else {
            guardedSetView(nextView);
          }
        },
        onSignIn: () => openLoginPage({ returnView: view || 'menu' }),
      }),
      _jsx('main', {
        className: 'pt-20 lg:pt-20 lg:pl-64',
        children: _jsxs(AnimatePresence, {
          mode: 'wait',
          children: [
            view === 'home' && _jsx(motion.div, { exit: { opacity: 0 }, children: _jsx(HostelSlider, { onEnterPortal: handleEnterPortal }) }, 'home'),
            view === 'about' && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(AboutPage, { onBack: resetToHome }) }, 'about'),
            view === 'menu' && _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, children: _jsx(MenuTable, { hostelId: selectedHostel || 'bh1', onDayClick: handleDayClick, onSelectHostel: setSelectedHostel, onSignInClick: () => openLoginPage({ returnView: 'menu' }) }) }, 'menu-view'),
            view === 'polls' && user && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(Polls, { onVote: () => openLoginPage({ returnView: 'polls' }), onBack: () => setView('menu') }) }, 'polls'),
            view === 'results' && user && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(ResultsPage, {}) }, 'results'),
            view === 'profile' && user && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(UserProfile, { onBack: () => setView('menu'), onAdminSwitch: () => setShowAdminLogin(true) }) }, 'profile'),
            view === 'admin' && user?.role === 'admin' && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(AdminPortal, { onBack: () => setView('profile') }) }, 'admin'),
            view === 'login' && _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(LoginPage, {
              onBack: () => {
                if (loginReturn?.hostelId && loginReturn?.day) {
                  setSelectedHostel(loginReturn.hostelId);
                  setSelectedDay(loginReturn.day);
                  setView('menu');
                } else {
                  setView('home');
                }
              },
              onSuccess: handleLoginSuccess,
              initialHostel: loginReturn?.hostelId || selectedHostel || 'bh1'
            }) }, 'login'),
          ]
        })
      }),
      _jsxs(AnimatePresence, {
        children: [
          selectedDay && _jsx(DayDetail, {
            dayMenu: selectedDay,
            hostelId: selectedHostel || user?.hostelId || 'bh1',
            onClose: () => setSelectedDay(null),
            onRequireLogin: handleRequireLoginForRating,
            pendingRating: pendingRating,
            onPendingRatingHandled: () => setPendingRating(null)
          }),
          showAdminLogin && _jsx(LoginModal, { onClose: () => setShowAdminLogin(false), mode: 'admin' })
        ]
      }),
      _jsx(Footer, { show: showFooter, onNavigate: guardedSetView })
    ]
  });
};

export default function App() {
  return _jsx(AuthProvider, { children: _jsx(SocketProvider, { children: _jsx(AppContent, {}) }) });
}

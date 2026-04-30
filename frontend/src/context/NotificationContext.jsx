import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(undefined);

const STORAGE_KEY = 'mess_notifications';

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { menu: false, polls: false, results: false };
    } catch {
      return { menu: false, polls: false, results: false };
    }
  });

  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const showToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Show toasts on page load or login if there are unseen notifications
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const notifs = saved ? JSON.parse(saved) : {};

    if (notifs.menu) {
      setTimeout(() => showToast({
        type: 'menu',
        emoji: '🍽️',
        title: 'Menu Updated!',
        message: 'The weekly menu has been changed.',
        page: 'menu',
        buttonText: 'View Menu',
      }), 500);
    }
    if (notifs.polls) {
      setTimeout(() => showToast({
        type: 'polls',
        emoji: '📊',
        title: 'New Poll!',
        message: 'A new poll is waiting for your vote.',
        page: 'polls',
        buttonText: 'View Polls',
      }), 1000);
    }
    if (notifs.results) {
      setTimeout(() => showToast({
        type: 'results',
        emoji: '📈',
        title: 'Results Available!',
        message: 'Poll results have been updated.',
        page: 'results',
        buttonText: 'View Results',
      }), 1500);
    }
  }, [user]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('menuUpdated', () => {
      setNotifications(prev => ({ ...prev, menu: true }));
      showToast({
        type: 'menu',
        emoji: '🍽️',
        title: 'Menu Updated!',
        message: 'The weekly menu has just been changed.',
        page: 'menu',
        buttonText: 'View Menu',
      });
    });

    socket.on('pollUpdate', () => {
      setNotifications(prev => ({ ...prev, polls: true, results: true }));
      showToast({
        type: 'polls',
        emoji: '📊',
        title: 'New Poll!',
        message: 'A new poll is waiting for your vote.',
        page: 'polls',
        buttonText: 'View Polls',
      });
    });

    return () => {
      socket.off('menuUpdated');
      socket.off('pollUpdate');
    };
  }, [socket]);

  const clearNotification = (page) => {
    setNotifications(prev => ({ ...prev, [page]: false }));
  };

  // Toast UI
  const ToastContainer = () => (
    <div style={{
      position: 'fixed', bottom: '24px', right: '16px',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '10px',
      maxWidth: '320px', width: '90vw',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '14px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: '8px',
          animation: 'slideIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{toast.emoji}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {toast.title}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', fontSize: '16px', lineHeight: 1,
                flexShrink: 0, padding: '0',
              }}
            >✕</button>
          </div>
          <button
            onClick={() => {
              dismissToast(toast.id);
              window.location.href = '/' + toast.page;
            }}
            style={{
              width: '100%', padding: '8px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {toast.buttonText} →
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification }}>
      {children}
      <ToastContainer />
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
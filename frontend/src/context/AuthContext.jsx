import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, setAuthToken } from '../services/api';

const AuthContext = createContext(undefined);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('mess_token');
    const savedUser = localStorage.getItem('mess_user');
    if (savedToken) { setToken(savedToken); setAuthToken(savedToken); }
    if (savedUser) { setUser(JSON.parse(savedUser)); }
  }, []);

  const login = async (hostel, roomNumber, pin) => {
    // 🗑️ DUMMY LOGIN - Accepts any credentials without validation
    setIsLoading(true);
    setError(null);
    try {
      const dummyToken = 'dummy_token_' + Math.random().toString(36).substr(2, 9);
      const dummyUser = {
        id: 'dummy_' + roomNumber,
        roomNumber: roomNumber || 'DUMMY_ROOM',
        hostel: hostel || 'bh1',
        hostelId: hostel || 'bh1',
        role: 'user',
        name: 'Test User',
      };
      
      setToken(dummyToken);
      setAuthToken(dummyToken);
      setUser(dummyUser);
      localStorage.setItem('mess_token', dummyToken);
      localStorage.setItem('mess_user', JSON.stringify(dummyUser));

      return { isFirstLogin: false };

    } catch (err) {
      setError('Dummy login error');
      throw new Error('Dummy login error');
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (hostel, password) => {
    // 🗑️ DUMMY ADMIN LOGIN - Accepts any credentials without validation
    setIsLoading(true);
    setError(null);
    try {
      const dummyToken = 'dummy_admin_token_' + Math.random().toString(36).substr(2, 9);
      const adminUser = {
        id: 'dummy_admin_' + hostel,
        name: 'Admin User',
        roomNumber: '',
        hostel: hostel || 'bh1',
        hostelId: hostel || 'bh1',
        role: 'admin',
      };
      setToken(dummyToken);
      setAuthToken(dummyToken);
      setUser(adminUser);
      localStorage.setItem('mess_token', dummyToken);
      localStorage.setItem('mess_user', JSON.stringify(adminUser));
    } catch (err) {
      setError('Dummy admin login error');
      throw new Error('Dummy admin login error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('mess_user');
    localStorage.removeItem('mess_token');
  };

  const sessionIdentity = user
    ? { hostel: user.hostel, roomNumber: user.roomNumber, hostelId: user.hostelId }
    : null;

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, logout, isLoading, error, sessionIdentity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
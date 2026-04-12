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
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(hostel, roomNumber, pin);
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
      localStorage.setItem('mess_token', data.token);
      localStorage.setItem('mess_user', JSON.stringify(data.user));
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (hostel, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.adminLogin(hostel, password);
      const adminUser = {
        id: data.admin.id,
        name: data.admin.name,
        roomNumber: '',
        hostel: data.admin.hostel,
        hostelId: data.admin.hostelId,
        role: 'admin',
      };
      setToken(data.token);
      setAuthToken(data.token);
      setUser(adminUser);
      localStorage.setItem('mess_token', data.token);
      localStorage.setItem('mess_user', JSON.stringify(adminUser));
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed. Please try again.';
      setError(message);
      throw new Error(message);
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
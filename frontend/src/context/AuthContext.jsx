import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needs2FA, setNeeds2FA] = useState(null); // { email, userId }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('user'); // Clear corrupted data
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth initialization timeout, setting loading to false');
      setLoading(false);
    }, 3000);

    initAuth();

    return () => clearTimeout(timeout);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      if (data.requires2FA) {
        setNeeds2FA({ email: data.email, userId: data.userId });
        return { success: true, requires2FA: true };
      }
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, recoveryPasscode: data.recoveryPasscode };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback for demo mode
      if (error.code === 'ECONNREFUSED' || !error.response) {
        const mockUser = { _id: 'demo_user', name: 'Demo User', email: email, role: 'admin', token: 'demo_token' };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { success: true };
      }
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const verifyTwoFactor = async (email, code) => {
    try {
      const { data } = await axios.post('/api/auth/verify-2fa', { email, code });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setNeeds2FA(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '2FA verification failed' };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const { data } = await axios.post('/api/auth/google-login', googleData);
      if (data.requires2FA) {
        setNeeds2FA({ email: data.email, userId: data.userId });
        return { success: true, requires2FA: true };
      }
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, recoveryPasscode: data.recoveryPasscode };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  const signup = async (name, email, password, secretPasscode) => {
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, secretPasscode });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, recoveryPasscode: data.recoveryPasscode };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const recover = async (email, secretPasscode) => {
    try {
      const { data } = await axios.post('/api/auth/recover', { email, secretPasscode });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Recovery failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, recover, googleLogin, verifyTwoFactor, needs2FA, setNeeds2FA, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

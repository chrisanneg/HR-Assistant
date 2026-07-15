import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    try {
      if (token) {
        // Set default axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Try to get user info from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Auth bootstrap error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });

      const { id: userId, token: authToken, username: userName, is_admin } = response.data;
      
      setToken(authToken);
      const userData = { id: userId || authToken, username: userName, isAdmin: is_admin };
      setUser(userData);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, isAdmin = false) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        password,
        is_admin: isAdmin
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
  };

  const loginAsGuest = () => {
    const guestData = { 
      username: 'Guest', 
      isAdmin: false, 
      isGuest: true 
    };
    setUser(guestData);
    // No token needed for guest access
    localStorage.setItem('userData', JSON.stringify(guestData));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loginAsGuest,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isGuest: user?.isGuest || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

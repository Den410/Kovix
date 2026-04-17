import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';
import CustomSpinner from '../components/CustomSpinner';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || decoded.sub || decoded.id,
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || decoded.name,
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role,
        avatarUrl: decoded.avatarUrl,
        isBlocked: decoded.isBlocked === "True" || decoded.isBlocked === true,
        exp: decoded.exp
      };
    } catch (error) {
      console.error("Помилка декодування токена:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getProfile();
      setUser(prev => ({ ...prev, ...res.data }));
    } catch (_err) {
      console.error("Помилка оновлення профілю", _err);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    const userData = parseUserFromToken(token);
    setUser(userData);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = parseUserFromToken(token);
      if (userData && userData.exp * 1000 > Date.now()) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(userData);
        refreshUser();
      } else {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  const isAdmin = () => user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAdmin, loading, refreshUser }}>
      {loading ? (
        <div className="site-loader">
          <CustomSpinner label="Завантаження сайту..." size="large" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
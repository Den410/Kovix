import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

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
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
            decoded.nameid || 
            decoded.sub || 
            decoded.id,
            
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                  decoded.unique_name || 
                  decoded.name,
                  
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
              decoded.role,
              
        avatarUrl: decoded.avatarUrl,
        
        exp: decoded.exp
      };
    } catch (error) {
      console.error("Помилка декодування токена:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = parseUserFromToken(token);
      if (userData && userData.exp * 1000 > Date.now()) {
          setUser(userData);
      } else {
          logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const userData = parseUserFromToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
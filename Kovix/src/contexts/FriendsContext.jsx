import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { friendsAPI } from '../services/api';

const FriendsContext = createContext();

export function useFriends() {
  return useContext(FriendsContext);
}

export function FriendsProvider({ children }) {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const updateRequestsCount = async () => {
    if (!user) {
        setRequestCount(0);
        return;
    }
    try {
      const res = await friendsAPI.getMyFriends();
      const pending = res.data.filter(f => f.status === 'PendingIncoming').length;
      setRequestCount(pending);
    } catch (e) {
      console.error("Помилка оновлення лічильника друзів", e);
    }
  };

  useEffect(() => {
    updateRequestsCount();
    
    const interval = setInterval(updateRequestsCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <FriendsContext.Provider value={{ requestCount, updateRequestsCount }}>
      {children}
    </FriendsContext.Provider>
  );
}
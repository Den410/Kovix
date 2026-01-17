import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { friendsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useChatConnection } from '../hooks/useChatConnection';

const FriendsContext = createContext();

export function useFriends() {
    return useContext(FriendsContext);
}

export function FriendsProvider({ children }) {
    const { user } = useAuth();
    const connection = useChatConnection(); 

    const [friends, setFriends] = useState([]); 
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [requestCount, setRequestCount] = useState(0);

    const loadFriends = useCallback(async () => {
        if (!user) {
            setFriends([]);
            setIncomingRequests([]);
            setRequestCount(0);
            return;
        }

        try {
            const res = await friendsAPI.getMyFriends();
            setFriends(res.data.map(f => ({
                id: f.userId,
                username: f.username,
                avatarUrl: f.avatarUrl,
                isOnline: f.isOnline || false,
                lastActive: f.lastActive || null,
                status: f.status 
            })));

            const incoming = res.data.filter(f => f.status === 'PendingIncoming');
            setIncomingRequests(incoming);
            setRequestCount(incoming.length);
        } catch (error) {
            console.error("Failed to load friends", error);
        }
    }, [user]);

    const updateFriendStatus = useCallback((friendId, isOnline, lastActive) => {
        setFriends(prev =>
            prev.map(f =>
                f.id === friendId ? { ...f, isOnline, lastActive } : f
            )
        );
    }, []);

    useEffect(() => {
        if (!connection) return;

        const handleStatusChange = (userId, isOnline, lastActive) => {
            updateFriendStatus(parseInt(userId), isOnline, lastActive);
        };

        connection.on('UserStatusChanged', handleStatusChange);

        return () => {
            connection.off('UserStatusChanged', handleStatusChange);
        };
    }, [connection, updateFriendStatus]);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    const value = {
        friends,
        incomingRequests,
        requestCount,
        refreshRequests: loadFriends,
        updateFriendStatus
    };

    return (
        <FriendsContext.Provider value={value}>
            {children}
        </FriendsContext.Provider>
    );
}
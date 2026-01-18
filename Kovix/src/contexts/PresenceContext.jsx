import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from './AuthContext';

const PresenceContext = createContext(null);

export const PresenceProvider = ({ children }) => {
    const { user, token } = useAuth();
    const connectionRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!user || !token) return;

        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5096/chatHub", { 
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.start()
            .then(() => {
                console.log('🟢 Presence connected');
                setConnected(true);
            })
            .catch(err => {
                if (err.toString().includes("negotiation") || err.toString().includes("stopped")) return;
                console.error('SignalR Connection Error:', err);
            });

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop()
                    .catch(err => console.error("Error stopping connection:", err))
                    .finally(() => {
                        connectionRef.current = null;
                        setConnected(false);
                    });
            }
        };
    }, [user, token]);

    return (
        <PresenceContext.Provider value={{ connection: connectionRef.current, connected }}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => useContext(PresenceContext);
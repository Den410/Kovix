import { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { getWebSocketUrl } from '../utils/apiConfig';

const SignalRContext = createContext();

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const wsUrl = getWebSocketUrl();
        const conn = new HubConnectionBuilder()
            .withUrl(`${wsUrl}/notificationHub`, {
                accessTokenFactory: () => localStorage.getItem('token')
            })
            .withAutomaticReconnect()
            .build();

        conn.start()
            .then(() => console.log("✅ SignalR connected"))
            .catch(console.error);

        setConnection(conn);

        return () => conn.stop();
    }, []);

    return (
        <SignalRContext.Provider value={connection}>
            {children}
        </SignalRContext.Provider>
    );
};
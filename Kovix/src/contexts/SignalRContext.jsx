import { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { getWebSocketUrl } from '../utils/apiConfig';

const SignalRContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConnection(conn);

        return () => conn.stop();
    }, []);

    return (
        <SignalRContext.Provider value={connection}>
            {children}
        </SignalRContext.Provider>
    );
};
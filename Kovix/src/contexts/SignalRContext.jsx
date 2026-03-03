import { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const SignalRContext = createContext();

export const useSignalR = () => useContext(SignalRContext);

const API_BASE_URL = 'http://localhost:5096';

export const SignalRProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const conn = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/notificationHub`, {
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
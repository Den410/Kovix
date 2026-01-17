import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

const API_BASE_URL = 'http://localhost:5096';

/**
 * useChatConnection - хук для підключення до SignalR хаба
 * @param {(connection: any) => void} onConnectedCallback - колбек для підписки на події або виклику методів після старту
 */
export const useChatConnection = (onConnectedCallback) => {
    const [connection, setConnection] = useState(null);
    const callbackRef = useRef(onConnectedCallback);

    useEffect(() => {
        callbackRef.current = onConnectedCallback;
    }, [onConnectedCallback]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/chatHub`, {
                accessTokenFactory: () => localStorage.getItem('token')
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                if (connection.state === HubConnectionState.Disconnected) {
                    if (callbackRef.current) {
                        callbackRef.current(connection);
                    }

                    await connection.start();
                    console.log('SignalR Connected via Hook');
                }
            } catch (err) {
                console.error('SignalR Connection Error:', err);
            }
        };

        startConnection();

        return () => {
            if (connection.state === HubConnectionState.Connected) {
                connection.stop().catch(err => console.error("Error stopping connection:", err));
            }
        };
    }, [connection]); 

    return connection;
};
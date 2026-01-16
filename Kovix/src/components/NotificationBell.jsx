import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5096';

function NotificationBell() {
    const { user } = useAuth(); 
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connection, setConnection] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/notificationHub`, {
                accessTokenFactory: () => localStorage.getItem('token')
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [user]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Notification Hub Connected');
                    
                    connection.on('ReceiveNotification', (notification) => {
                        console.log("Отримано сповіщення:", notification); 
                        setNotifications(prev => [notification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    });
                })
                .catch(err => console.error('Connection failed: ', err));
        }
    }, [connection]);

    const handleNotificationClick = (note) => {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.filter(n => n !== note)); 

        if (note.message && note.message.includes("Скарга")) {
            navigate('/admin/reports');
            setIsOpen(false); 
        }
    };

    return (
        <div className="position-relative">
            <button 
                className="btn btn-dark position-relative" 
                onClick={() => setIsOpen(!isOpen)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="card position-absolute end-0 mt-2 shadow" style={{ width: '350px', zIndex: 1000 }}>
                    <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <li className="list-group-item text-muted text-center">Немає нових сповіщень</li>
                        ) : (
                            notifications.map((note, index) => (
                                <li 
                                    key={index} 
                                    className="list-group-item list-group-item-action" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleNotificationClick(note)} 
                                >
                                    <small>{note.message}</small>
                                    {note.message.includes("Скарга") && (
                                        <div className="text-end mt-1">
                                            <span className="badge bg-danger" style={{fontSize: '0.6rem'}}>Натисніть для деталей</span>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
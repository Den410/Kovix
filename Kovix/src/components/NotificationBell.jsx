import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFriends } from '../contexts/FriendsContext';
import { FiBell } from 'react-icons/fi';
import '../style/NotificationBell.css';

const API_BASE_URL = 'http://localhost:5096';

function NotificationBell() {
    const { user } = useAuth(); 
    const { incomingRequests, requestCount, refreshRequests } = useFriends(); 

    const [notifications, setNotifications] = useState([]);
    const [connection, setConnection] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        if ((isOpen || location.pathname) && user) {
            refreshRequests();
        }
    }, [isOpen, location.pathname, user, refreshRequests]);

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
                        if (notification.message.includes("friend") || notification.message.includes("друзі")) {
                            refreshRequests();
                        }
                        setNotifications(prev => [notification, ...prev]);
                    });
                })
                .catch(err => console.error('Connection failed: ', err));
        }
    }, [connection, refreshRequests]);

    const handleNotificationClick = (note) => {
        setNotifications(prev => prev.filter(n => n !== note)); 
        if (note.message && note.message.includes("Скарга")) {
            navigate('/admin/reports');
            setIsOpen(false); 
        }
    };

    const handleFriendRequestClick = () => {
        navigate('/profile');
        setIsOpen(false);
    };

    const totalCount = notifications.length + requestCount;

    return (
        <div className="position-relative">
           <button
                className="btn position-relative p-0 border-0 notification-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiBell className="bell-icon solid" />

                {totalCount > 0 && (
                    <span className="badge-counter">
                        {totalCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    className="card position-absolute end-0 mt-2 shadow" 
                    style={{ 
                        width: '350px', 
                        zIndex: 1000,
                        backgroundColor: 'var(--bg-card)', 
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <div 
                        className="card-header fw-bold"
                        style={{
                            backgroundColor: 'var(--bg-panel)',
                            color: 'var(--text-main)',
                            borderBottom: '1px solid var(--border-color)'
                        }}
                    >
                        Сповіщення
                    </div>
                    
                    <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        
                        {totalCount === 0 && (
                            <li 
                                className="list-group-item text-center"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-muted)',
                                    borderBottom: '1px solid var(--border-color)'
                                }}
                            >
                                Немає нових сповіщень
                            </li>
                        )}

                        {incomingRequests.map(req => (
                            <li 
                                key={`friend-${req.id}`} 
                                className="list-group-item" 
                                style={{ 
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--bg-card)', 
                                    color: 'var(--text-main)',
                                    borderBottom: '1px solid var(--border-color)'
                                }}
                                onClick={handleFriendRequestClick} 
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="fw-bold text-primary">👤 Запит у друзі</small>
                                        <div className="small">Від: {req.username}</div>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">Переглянути</span>
                                </div>
                            </li>
                        ))}

                        {notifications.map((note, index) => (
                            <li 
                                key={`note-${index}`} 
                                className="list-group-item"
                                style={{ 
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    borderBottom: '1px solid var(--border-color)'
                                }}
                                onClick={() => handleNotificationClick(note)} 
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                            >
                                <div className="d-flex flex-column">
                                    <small>{note.message}</small>
                                    {note.message.includes("Скарга") && (
                                        <div className="text-end mt-1">
                                            <span className="badge bg-danger" style={{fontSize: '0.6rem'}}>Деталі</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
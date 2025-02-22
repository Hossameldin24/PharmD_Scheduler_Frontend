import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import '../styles/theme.css';
import axios from 'axios';

const NotificationCenter = ({ userType, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const wsRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${userType}/${userId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [userType, userId]);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const handleAttendanceAction = async (requestId, approve) => {
        try {
            await axios.post(
                'http://127.0.0.1:8000/respond_attendance_request/',
                {
                    request_id: requestId,
                    approve: approve
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            
            setNotifications(prev => prev.filter(n => n.id !== requestId));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(`Failed to respond to attendance request:`, err);
        }
    };

    return (
        <div className="notification-center">
            <button 
                className="notification-bell" 
                onClick={toggleNotifications}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <h3>Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications</p>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map((notification, index) => (
                                <li 
                                    key={index} 
                                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                                >
                                    <p className="notification-message">{notification.message}</p>
                                    {notification.type === 'attendance_request' && userType === 'preceptor' && (
                                        <div className="notification-actions">
                                            <button 
                                                className="button-success"
                                                onClick={() => handleAttendanceAction(notification.id, 'approve')}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="button-error"
                                                onClick={() => handleAttendanceAction(notification.id, 'deny')}
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    )}
                                    <span className="notification-time">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 
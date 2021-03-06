import React, { useState, useEffect, useMemo } from 'react';
import { MdNotifications } from 'react-icons/md';
import { parseISO, formatDistance } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '~/services/api';

import {
    Container,
    Bedge,
    NotificationList,
    Scroll,
    Notification
} from './styles';

export default function Notifications() {
    const [visible, setVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);

    function handleToggleVisible() {
        setVisible(!visible);
    }

    useEffect(() => {
        async function loadNotifications() {
            const response = await api.get('/notifications');

            const data = response.data.map(notification => ({
                ...notification,
                timeDistance: formatDistance(
                    parseISO(notification.createdAt),
                    new Date(),
                    { addSuffix: true, locale: ptBR }
                )
            }));

            setNotifications(data);
        }

        loadNotifications();
    }, []);

    async function handleMarkAsRead(id) {
        await api.put(`/notifications/${id}`);

        setNotifications(
            notifications.map(notification =>
                notification._id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }

    const hasUnread = useMemo(() => {
        return !!notifications.find(
            notification => notification.read === false
        );
    }, [notifications]);

    return (
        <Container>
            <Bedge onClick={handleToggleVisible} hasUnread={hasUnread}>
                <MdNotifications color="#7159c1" size={20} />
            </Bedge>

            <NotificationList visible={visible}>
                <Scroll>
                    {notifications.map(notification => (
                        <Notification
                            key={notification._id}
                            unread={!notification.read}
                        >
                            <p>{notification.content}</p>
                            <time>{notification.timeDistance}</time>
                            {!notification.read && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleMarkAsRead(notification._id)
                                    }
                                >
                                    Marcar como lida
                                </button>
                            )}
                        </Notification>
                    ))}
                </Scroll>
            </NotificationList>
        </Container>
    );
}

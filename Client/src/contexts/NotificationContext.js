import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [authLoading, isAuthenticated]);

  const normalizeNotification = (notification) => ({
    ...notification,
    isRead: typeof notification.isRead === 'boolean' ? notification.isRead : Boolean(notification.read),
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getAll();
      const data = response.success ? response.data || [] : [];
      const normalizedNotifications = data.map(normalizeNotification);

      setNotifications(normalizedNotifications);
      updateUnreadCount(normalizedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.success(notification.message);
  };

  const markAsRead = async (notificationId) => {
    const previousNotifications = notifications;
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationsAPI.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setNotifications(previousNotifications);
      updateUnreadCount(previousNotifications);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    const previousNotifications = notifications;
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);

    try {
      await notificationsAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setNotifications(previousNotifications);
      updateUnreadCount(previousNotifications);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (notificationId) => {
    const previousNotifications = notifications;
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });

    try {
      await notificationsAPI.delete(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setNotifications(previousNotifications);
      updateUnreadCount(previousNotifications);
      toast.error('Failed to delete notification');
    }
  };

  const updateUnreadCount = (notificationList) => {
    const unread = notificationList.filter(notif => !notif.isRead).length;
    setUnreadCount(unread);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

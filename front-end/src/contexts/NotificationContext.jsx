import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import moment from 'moment';

// IMPORTANT: Export the context so it can be imported by other files
export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    enabled: true,
    browserNotifications: false,
    soundEnabled: true,
    dueTodayTime: '09:00',
    oneHourBefore: true,
    oneDayBefore: true,
    overdueDaily: true,
    overdueTime: '00:00'
  });

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Show browser notification
  const showBrowserNotification = (title, body, icon = '/logo.png') => {
    if (!settings.browserNotifications || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200],
      tag: 'taskmaster-notification',
      requireInteraction: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Play sound
    if (settings.soundEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  // Add in-app notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification
    if (settings.browserNotifications) {
      showBrowserNotification(notification.title, notification.message);
    }

    return newNotification;
  }, [settings.browserNotifications, settings.soundEnabled]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === notificationId);
      if (notif && !notif.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // If enabling browser notifications, request permission
    if (newSettings.browserNotifications && !settings.browserNotifications) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setSettings(prev => ({ ...prev, browserNotifications: false }));
        return false;
      }
    }

    // Save to backend
    try {
      await api.put('/auth/notification-settings', newSettings);
      return true;
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      return false;
    }
  }, [settings.browserNotifications]);

  // Load settings from backend
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const response = await api.get('/auth/notification-settings');
        if (response.data) {
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch (error) {
        console.log('Using default notification settings');
      }
    };

    loadSettings();
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        updateSettings,
        requestNotificationPermission,
        showBrowserNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Export the useNotifications hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
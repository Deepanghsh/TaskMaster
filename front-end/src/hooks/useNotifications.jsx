import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTodos } from "./useTodos";
import { 
  isTaskOverdue, 
  isTaskDueToday, 
  isTaskDueTomorrow,
  getDaysOverdue 
} from "../utils/notificationUtils";
import moment from "moment";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { todos } = useTodos();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Notification settings
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

  // Load read notifications from localStorage
  const loadReadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('readNotifications');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log('📋 Loaded read IDs from storage:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error loading read notifications:', error);
      return [];
    }
  }, []);

  // Save read notifications to localStorage
  const saveReadNotifications = useCallback((readIds) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
      console.log('✅ Saved read notifications to storage:', readIds);
    } catch (error) {
      console.error('❌ Error saving read notifications:', error);
    }
  }, []);

  // Load deleted notifications from localStorage
  const loadDeletedNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('deletedNotifications');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log('📋 Loaded deleted IDs from storage:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error loading deleted notifications:', error);
      return [];
    }
  }, []);

  // Save deleted notifications to localStorage
  const saveDeletedNotifications = useCallback((deletedIds) => {
    try {
      localStorage.setItem('deletedNotifications', JSON.stringify(deletedIds));
      console.log('🗑️ Saved deleted notifications to storage:', deletedIds);
    } catch (error) {
      console.error('❌ Error saving deleted notifications:', error);
    }
  }, []);

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
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          console.log('Could not play notification sound');
        });
      } catch (error) {
        console.log('Audio not available');
      }
    }
  };

  // Generate notifications from todos
  const generateNotifications = useCallback(() => {
    const newNotifications = [];
    const now = moment();
    const readIds = loadReadNotifications();
    const deletedIds = loadDeletedNotifications();

    console.log('🔄 Regenerating notifications...');
    console.log('   Read IDs:', readIds);
    console.log('   Deleted IDs:', deletedIds);

    // Filter only non-archived, non-completed tasks
    const activeTasks = todos.filter(todo => !todo.archived && !todo.completed);

    activeTasks.forEach(task => {
      let notifId;
      let notification;

      // Overdue tasks
      if (isTaskOverdue(task)) {
        const daysOverdue = getDaysOverdue(task);
        notifId = `overdue-${task._id}`;
        
        // Skip if deleted
        if (deletedIds.includes(notifId)) {
          console.log('⏭️  Skipping deleted notification:', notifId);
          return;
        }
        
        notification = {
          id: notifId,
          taskId: task._id,
          type: 'overdue',
          priority: 'high',
          title: 'Overdue Task',
          message: `"${task.text}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
          task: task,
          timestamp: now.toISOString(),
          read: readIds.includes(notifId)
        };
        newNotifications.push(notification);
      }
      // Due today
      else if (isTaskDueToday(task)) {
        notifId = `due-today-${task._id}`;
        
        // Skip if deleted
        if (deletedIds.includes(notifId)) {
          console.log('⏭️  Skipping deleted notification:', notifId);
          return;
        }
        
        notification = {
          id: notifId,
          taskId: task._id,
          type: 'due_today',
          priority: task.priority === 'High' ? 'high' : 'medium',
          title: 'Due Today',
          message: `"${task.text}" is due today`,
          task: task,
          timestamp: now.toISOString(),
          read: readIds.includes(notifId)
        };
        newNotifications.push(notification);
      }
      // Due tomorrow
      else if (isTaskDueTomorrow(task)) {
        notifId = `due-tomorrow-${task._id}`;
        
        // Skip if deleted
        if (deletedIds.includes(notifId)) {
          console.log('⏭️  Skipping deleted notification:', notifId);
          return;
        }
        
        notification = {
          id: notifId,
          taskId: task._id,
          type: 'due_tomorrow',
          priority: task.priority === 'High' ? 'high' : 'medium',
          title: 'Due Tomorrow',
          message: `"${task.text}" is due tomorrow`,
          task: task,
          timestamp: now.toISOString(),
          read: readIds.includes(notifId)
        };
        newNotifications.push(notification);
      }
    });

    // Sort by priority (high first) and then by timestamp
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const unread = newNotifications.filter(n => !n.read).length;
    console.log(`📬 Generated ${newNotifications.length} notifications, ${unread} unread`);

    setNotifications(newNotifications);
    setUnreadCount(unread);
  }, [todos, loadReadNotifications, loadDeletedNotifications]);

  // Generate notifications whenever todos change
  useEffect(() => {
    generateNotifications();
  }, [generateNotifications]);

  // Clean up localStorage ONLY when tasks are actually deleted
  useEffect(() => {
    const cleanupStorage = () => {
      const readIds = loadReadNotifications();
      const deletedIds = loadDeletedNotifications();
      const allTaskIds = todos.map(t => t._id);

      const validReadIds = readIds.filter(id => {
        const taskId = id.split('-').slice(1).join('-');
        return allTaskIds.includes(taskId);
      });
      
      const validDeletedIds = deletedIds.filter(id => {
        const taskId = id.split('-').slice(1).join('-');
        return allTaskIds.includes(taskId);
      });
      
      if (validReadIds.length !== readIds.length) {
        console.log('🧹 Cleaning up read notifications for deleted tasks');
        saveReadNotifications(validReadIds);
      }
      
      if (validDeletedIds.length !== deletedIds.length) {
        console.log('🧹 Cleaning up deleted notifications for deleted tasks');
        saveDeletedNotifications(validDeletedIds);
      }
    };

    if (todos.length > 0) {
      cleanupStorage();
    }
  }, [todos.length]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notificationSettings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        console.log('⚙️ Loaded notification settings:', parsedSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // If enabling browser notifications, request permission
    if (newSettings.browserNotifications && !settings.browserNotifications) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        updatedSettings.browserNotifications = false;
        setSettings(updatedSettings);
        return false;
      }
    }

    // Save to localStorage
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      console.log('⚙️ Saved notification settings:', updatedSettings);
      return true;
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      return false;
    }
  }, [settings]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    console.log('📖 Marking as read:', notificationId);
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const readIds = loadReadNotifications();
    if (!readIds.includes(notificationId)) {
      const newReadIds = [...readIds, notificationId];
      saveReadNotifications(newReadIds);
    }
  }, [loadReadNotifications, saveReadNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    console.log('📖 Marking ALL as read');
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    const allIds = notifications.map(n => n.id);
    saveReadNotifications(allIds);
  }, [notifications, saveReadNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    console.log('🗑️ Clearing all notifications');
    
    const allIds = notifications.map(n => n.id);
    const deletedIds = loadDeletedNotifications();
    const newDeletedIds = [...new Set([...deletedIds, ...allIds])];
    saveDeletedNotifications(newDeletedIds);
    
    setNotifications([]);
    setUnreadCount(0);
    
    console.log('🗑️ All notifications marked as deleted');
  }, [notifications, loadDeletedNotifications, saveDeletedNotifications]);

  // Delete single notification
  const deleteNotification = useCallback((notificationId) => {
    console.log('🗑️ Deleting notification:', notificationId);
    
    const deletedIds = loadDeletedNotifications();
    if (!deletedIds.includes(notificationId)) {
      const newDeletedIds = [...deletedIds, notificationId];
      saveDeletedNotifications(newDeletedIds);
    }
    
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      const unreadFiltered = filtered.filter(n => !n.read).length;
      setUnreadCount(unreadFiltered);
      return filtered;
    });

    const readIds = loadReadNotifications();
    if (readIds.includes(notificationId)) {
      const updatedReadIds = readIds.filter(id => id !== notificationId);
      saveReadNotifications(updatedReadIds);
      console.log('🧹 Removed from read list');
    }
  }, [loadDeletedNotifications, saveDeletedNotifications, loadReadNotifications, saveReadNotifications]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        settings,
        markAsRead, 
        markAllAsRead, 
        clearAll,
        deleteNotification,
        updateSettings,
        requestNotificationPermission,
        showBrowserNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
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

  // Clean up localStorage when tasks are completed/deleted
  useEffect(() => {
    const cleanupStorage = () => {
      const readIds = loadReadNotifications();
      const deletedIds = loadDeletedNotifications();
      const currentTaskIds = todos.map(t => t._id);
      
      // Keep only IDs for tasks that still exist
      const validReadIds = readIds.filter(id => {
        const taskId = id.split('-').slice(1).join('-');
        return currentTaskIds.includes(taskId);
      });
      
      const validDeletedIds = deletedIds.filter(id => {
        const taskId = id.split('-').slice(1).join('-');
        return currentTaskIds.includes(taskId);
      });
      
      if (validReadIds.length !== readIds.length) {
        console.log('🧹 Cleaning up old read notifications');
        saveReadNotifications(validReadIds);
      }
      
      if (validDeletedIds.length !== deletedIds.length) {
        console.log('🧹 Cleaning up old deleted notifications');
        saveDeletedNotifications(validDeletedIds);
      }
    };

    cleanupStorage();
  }, [todos, loadReadNotifications, loadDeletedNotifications, saveReadNotifications, saveDeletedNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    console.log('📖 Marking as read:', notificationId);
    
    // Update state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Save to localStorage
    const readIds = loadReadNotifications();
    if (!readIds.includes(notificationId)) {
      const newReadIds = [...readIds, notificationId];
      saveReadNotifications(newReadIds);
    }
  }, [loadReadNotifications, saveReadNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    console.log('📖 Marking ALL as read');
    
    // Update state
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    // Save all notification IDs to localStorage
    const allIds = notifications.map(n => n.id);
    saveReadNotifications(allIds);
  }, [notifications, saveReadNotifications]);

  // Clear all notifications (marks them as deleted, NOT read)
  const clearAll = useCallback(() => {
    console.log('🗑️ Clearing all notifications');
    
    // Get current notification IDs
    const allIds = notifications.map(n => n.id);
    
    // Add to deleted list
    const deletedIds = loadDeletedNotifications();
    const newDeletedIds = [...new Set([...deletedIds, ...allIds])];
    saveDeletedNotifications(newDeletedIds);
    
    // Clear state
    setNotifications([]);
    setUnreadCount(0);
    
    // ⚠️ DO NOT clear readNotifications here!
    // Just leave it as is - deleted notifications won't regenerate anyway
    console.log('🗑️ All notifications marked as deleted');
  }, [notifications, loadDeletedNotifications, saveDeletedNotifications]);

  // Delete single notification
  const deleteNotification = useCallback((notificationId) => {
    console.log('🗑️ Deleting notification:', notificationId);
    
    // Add to deleted list
    const deletedIds = loadDeletedNotifications();
    if (!deletedIds.includes(notificationId)) {
      const newDeletedIds = [...deletedIds, notificationId];
      saveDeletedNotifications(newDeletedIds);
    }
    
    // Update state
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      const unreadFiltered = filtered.filter(n => !n.read).length;
      setUnreadCount(unreadFiltered);
      return filtered;
    });

    // Remove from read list if present
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
        markAsRead, 
        markAllAsRead, 
        clearAll,
        deleteNotification
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
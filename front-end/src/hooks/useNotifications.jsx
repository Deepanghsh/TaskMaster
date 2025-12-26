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

  // Generate notifications from todos
  const generateNotifications = useCallback(() => {
    const newNotifications = [];
    const now = moment();

    // Filter only non-archived, non-completed tasks
    const activeTasks = todos.filter(todo => !todo.archived && !todo.completed);

    activeTasks.forEach(task => {
      // Overdue tasks
      if (isTaskOverdue(task)) {
        const daysOverdue = getDaysOverdue(task);
        newNotifications.push({
          id: `overdue-${task._id}`,
          taskId: task._id,
          type: 'overdue',
          priority: 'high',
          title: 'Overdue Task',
          message: `"${task.text}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
          task: task,
          timestamp: now.toISOString(),
          read: false
        });
      }
      // Due today
      else if (isTaskDueToday(task)) {
        newNotifications.push({
          id: `due-today-${task._id}`,
          taskId: task._id,
          type: 'due_today',
          priority: task.priority === 'High' ? 'high' : 'medium',
          title: 'Due Today',
          message: `"${task.text}" is due today`,
          task: task,
          timestamp: now.toISOString(),
          read: false
        });
      }
      // Due tomorrow
      else if (isTaskDueTomorrow(task)) {
        newNotifications.push({
          id: `due-tomorrow-${task._id}`,
          taskId: task._id,
          type: 'due_tomorrow',
          priority: task.priority === 'High' ? 'high' : 'medium',
          title: 'Due Tomorrow',
          message: `"${task.text}" is due tomorrow`,
          task: task,
          timestamp: now.toISOString(),
          read: false
        });
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

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [todos]);

  // Generate notifications whenever todos change
  useEffect(() => {
    generateNotifications();
  }, [generateNotifications]);

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
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      const unreadFiltered = filtered.filter(n => !n.read).length;
      setUnreadCount(unreadFiltered);
      return filtered;
    });
  }, []);

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
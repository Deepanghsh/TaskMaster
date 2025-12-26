import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Check, AlertCircle, Clock, Calendar, Trash2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'due_today':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'due_tomorrow':
        return <Clock className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type, read) => {
    if (read) return 'bg-gray-50 dark:bg-gray-800/50';
    
    switch (type) {
      case 'overdue':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'due_today':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'due_tomorrow':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[priority] || colors.medium;
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate to the appropriate page based on notification type
    if (notification.type === 'overdue' || notification.type === 'due_today') {
      navigate('/');
    } else if (notification.type === 'due_tomorrow') {
      navigate('/upcoming');
    }
    
    setIsOpen(false);
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all group shadow-sm bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
      >
        <Bell className="w-5 h-5 text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors" />
        <span className="hidden lg:inline text-sm font-semibold text-indigo-800 dark:text-indigo-200">
          Notifications
        </span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 font-medium transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 font-medium transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    No notifications yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    We'll notify you about upcoming tasks
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        getNotificationBgColor(notification.type, notification.read)
                      } ${!notification.read ? 'border-l-4 border-indigo-500' : ''}`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Task Details */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              getPriorityBadge(notification.task.priority.toLowerCase())
                            }`}>
                              {notification.task.priority}
                            </span>
                            
                            {notification.task.category && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                                {notification.task.category}
                              </span>
                            )}

                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {moment(notification.timestamp).fromNow()}
                            </span>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React from 'react';
import { X, Clock, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import moment from 'moment';
import { motion } from 'framer-motion';

const NotificationItem = ({ notification, onRead, onClear, onClick }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'due_today':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'due_tomorrow':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case 'due_soon':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'due_today':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'due_tomorrow':
        return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
      case 'due_soon':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'overdue':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    const colors = {
      High: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      Medium: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      Low: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    };

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${colors[priority] || colors.Low}`}>
        {priority}
      </span>
    );
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onClear(notification.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all group ${
        getNotificationColor(notification.type)
      } ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
      )}

      <div className="flex gap-3 pl-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            
            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
              title="Clear notification"
            >
              <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
            {notification.message}
          </p>

          {/* Priority Badge */}
          {notification.priority && (
            <div className="mb-2">
              {getPriorityBadge(notification.priority)}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{moment(notification.timestamp).fromNow()}</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

export default NotificationItem;
import React, { useState } from "react";
import { useTodos } from "../hooks/useTodos";
import TodoItem from "../components/TodoItem";
import { CheckCircle2, Calendar, TrendingUp, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

export default function CompletedTasks() {
  const { todos } = useTodos();
  const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, month

  // Get completed tasks (not archived, not deleted)
  const completedTasks = todos
    .filter(todo => todo.completed && !todo.archived)
    .sort((a, b) => {
      // Sort by completion date (newest first)
      // Use completedAt if available, otherwise fall back to createdAt
      const aDate = a.completedAt || a.createdAt;
      const bDate = b.completedAt || b.createdAt;
      
      if (aDate && bDate) {
        return new Date(bDate) - new Date(aDate);
      }
      return 0;
    });

  // Filter by time period
  const filteredTasks = completedTasks.filter(todo => {
    if (timeFilter === "all") return true;
    
    // Use completedAt if available, otherwise fall back to createdAt
    const dateToUse = todo.completedAt || todo.createdAt;
    if (!dateToUse) return false;
    
    const completedDate = moment(dateToUse);
    const now = moment();
    
    switch (timeFilter) {
      case "today":
        return completedDate.isSame(now, 'day');
      case "week":
        return completedDate.isAfter(now.clone().subtract(7, 'days'));
      case "month":
        return completedDate.isAfter(now.clone().subtract(30, 'days'));
      default:
        return true;
    }
  });

  // Group by date
  const groupedTasks = filteredTasks.reduce((groups, todo) => {
    // Use completedAt if available, otherwise fall back to createdAt
    const dateToUse = todo.completedAt || todo.createdAt;
    
    if (!dateToUse) {
      // If no date at all, put in "Recently Completed"
      if (!groups['Recently Completed']) {
        groups['Recently Completed'] = [];
      }
      groups['Recently Completed'].push(todo);
      return groups;
    }
    
    const completedDate = moment(dateToUse);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    
    let dateKey;
    if (completedDate.isSame(today, 'day')) {
      dateKey = 'Today';
    } else if (completedDate.isSame(yesterday, 'day')) {
      dateKey = 'Yesterday';
    } else if (completedDate.isAfter(moment().subtract(7, 'days'))) {
      dateKey = completedDate.format('dddd, MMM D');
    } else {
      dateKey = completedDate.format('MMM D, YYYY');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(todo);
    
    return groups;
  }, {});

  const sortedDateGroups = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    if (a === 'Recently Completed') return 1;
    if (b === 'Recently Completed') return -1;
    return moment(b, 'MMM D, YYYY').diff(moment(a, 'MMM D, YYYY'));
  });

  // Stats
  const todayCount = completedTasks.filter(t => {
    const date = t.completedAt || t.createdAt;
    return date && moment(date).isSame(moment(), 'day');
  }).length;
  
  const weekCount = completedTasks.filter(t => {
    const date = t.completedAt || t.createdAt;
    return date && moment(date).isAfter(moment().subtract(7, 'days'));
  }).length;
  
  const monthCount = completedTasks.filter(t => {
    const date = t.completedAt || t.createdAt;
    return date && moment(date).isAfter(moment().subtract(30, 'days'));
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-9 h-9 text-amber-500" />
            Completed Tasks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed · Keep up the great work! 🎉
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-sm"
          >
            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Today</p>
            <p className="text-3xl font-black text-green-700 dark:text-green-300">{todayCount}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm"
          >
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">This Week</p>
            <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{weekCount}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-sm"
          >
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">This Month</p>
            <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{monthCount}</p>
          </motion.div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Filter:
          </span>
          {[
            { value: 'all', label: 'All Time', color: 'indigo' },
            { value: 'today', label: 'Today', color: 'green' },
            { value: 'week', label: 'This Week', color: 'blue' },
            { value: 'month', label: 'This Month', color: 'purple' }
          ].map(filter => (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                timeFilter === filter.value
                  ? `bg-${filter.color}-600 text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="mb-6">
              <TrendingUp className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No completed tasks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Complete some tasks to see your achievements here!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {sortedDateGroups.map(dateKey => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Date Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        {dateKey}
                      </h2>
                    </div>
                    <span className="px-4 py-1.5 bg-white dark:bg-gray-700 rounded-full text-sm font-black text-gray-700 dark:text-gray-300 border-2 border-green-200 dark:border-green-700 shadow-sm">
                      {groupedTasks[dateKey].length} task{groupedTasks[dateKey].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Tasks Grid - 2 Columns */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {groupedTasks[dateKey].map(todo => (
                      <motion.div
                        key={todo._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative group"
                      >
                        {/* Completed Badge */}
                        <div className="absolute -top-3 -right-3 z-10">
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white dark:border-gray-800"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </motion.div>
                        </div>
                        
                        <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                          <TodoItem todo={todo} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Motivational Footer */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 text-center"
        >
          <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Amazing Progress! 🎉
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You've completed <span className="font-black text-indigo-600 dark:text-indigo-400">{completedTasks.length}</span> tasks. Keep crushing your goals!
          </p>
        </motion.div>
      )}
    </div>
  );
}
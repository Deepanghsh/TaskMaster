import React from "react";
import { useTodos } from "../hooks/useTodos";
import TodoItem from "../components/TodoItem";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { isTaskOverdue, getDaysOverdue } from "../utils/notificationUtils";

export default function Upcoming() {
  const { todos } = useTodos();

  // Filter: Only next 7 days, NOT archived, NOT completed
  const upcomingTasks = todos
    .filter(todo => {
      // Exclude archived, completed tasks, and tasks without due dates
      if (todo.archived || todo.completed || !todo.dueDate) return false;
      
      const dueDate = moment(todo.dueDate);
      const today = moment().startOf('day');
      const sevenDaysFromNow = moment().add(7, 'days').endOf('day');
      
      return dueDate.isBetween(today, sevenDaysFromNow, null, '[]');
    })
    .sort((a, b) => {
      // Sort by due date, then priority
      const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });

  // Group by date
  const groupedTasks = upcomingTasks.reduce((groups, todo) => {
    const dueDate = moment(todo.dueDate);
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    
    let dateKey;
    if (dueDate.isSame(today, 'day')) {
      dateKey = 'Today';
    } else if (dueDate.isSame(tomorrow, 'day')) {
      dateKey = 'Tomorrow';
    } else {
      dateKey = dueDate.format('dddd, MMM D');
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
    if (a === 'Tomorrow') return -1;
    if (b === 'Tomorrow') return 1;
    return moment(a, 'dddd, MMM D') - moment(b, 'dddd, MMM D');
  });

  // Stats
  const todayCount = groupedTasks['Today']?.length || 0;
  const highPriorityCount = upcomingTasks.filter(t => t.priority === 'High').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-600" />
            Upcoming Tasks
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Next 7 days • {upcomingTasks.length} active task{upcomingTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Due Today</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{todayCount}</p>
          </div>
          
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">High Priority</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{highPriorityCount}</p>
          </div>
        </div>
      </div>

      {/* Tasks Grouped by Date - 2 COLUMN GRID */}
      <div className="space-y-8">
        {upcomingTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-4">
              <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              All caught up! 🎉
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No active tasks due in the next 7 days.
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
                <div className={`p-5 border-b border-gray-200 dark:border-gray-700 ${
                  dateKey === 'Today'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                    : dateKey === 'Tomorrow'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${
                        dateKey === 'Today' ? 'text-blue-600 dark:text-blue-400' :
                        dateKey === 'Tomorrow' ? 'text-green-600 dark:text-green-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {dateKey}
                      </h2>
                    </div>
                    <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {groupedTasks[dateKey].length} task{groupedTasks[dateKey].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Tasks Grid - 2 COLUMNS with generous spacing */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedTasks[dateKey].map(todo => {
                      const overdue = isTaskOverdue(todo);
                      const daysOverdue = overdue ? getDaysOverdue(todo) : 0;

                      return (
                        <motion.div
                          key={todo._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative h-full"
                        >
                          {overdue && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                                <span>🔴</span>
                                <span>{daysOverdue}d overdue</span>
                              </div>
                            </div>
                          )}
                          
                          <div className={`h-full ${overdue ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-800 rounded-xl' : ''}`}>
                            <TodoItem todo={todo} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
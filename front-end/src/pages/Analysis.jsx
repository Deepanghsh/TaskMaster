import React from 'react';
import { useTodos } from '../hooks/useTodos';
import AnalyticsChart from '../components/AnalyticsChart';
import TaskHeatmap from '../components/TaskHeatmap';
import { motion } from 'framer-motion';
import moment from 'moment';
import { Activity, CheckCircle2, ListTodo, TrendingUp, CalendarDays, BarChart3, Archive } from 'lucide-react';

const Analysis = () => {
  const { todos } = useTodos();

  const activeTodos = todos.filter(t => !t.archived);
  const archivedCount = todos.filter(t => t.archived).length;
  const completed = activeTodos.filter(t => t.completed).length;
  const pending = activeTodos.filter(t => !t.completed).length;
  const total = activeTodos.length;

  const getStatsForRange = (days) => {
    const rangeStart = moment().subtract(days, 'days').startOf('day');
    const tasksInRange = todos.filter(t => 
      moment(t.completedAt || t.updatedAt || t.dueDate).isAfter(rangeStart)
    );
    
    return {
      done: tasksInRange.filter(t => t.completed).length,
      pending: tasksInRange.filter(t => !t.completed && !t.archived).length,
      total: tasksInRange.length,
      rate: tasksInRange.length > 0 
        ? Math.round((tasksInRange.filter(t => t.completed).length / tasksInRange.length) * 100) 
        : 0
    };
  };

  const weekly = getStatsForRange(7);
  const monthly = getStatsForRange(30);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20"
    >
      <div className="flex items-center gap-3">
        <Activity className="text-indigo-600 w-8 h-8" />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Analysis & Insights</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', val: total, color: 'from-blue-500 to-indigo-600', icon: ListTodo },
          { label: 'Completed', val: completed, color: 'from-emerald-500 to-teal-600', icon: CheckCircle2 },
          { label: 'Pending', val: pending, color: 'from-orange-500 to-rose-600', icon: TrendingUp },
          { label: 'Archived', val: archivedCount, color: 'from-purple-500 to-fuchsia-600', icon: Archive }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 bg-gradient-to-br ${item.color} rounded-3xl shadow-lg text-white relative overflow-hidden group transition-all`}
          >
            <item.icon className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-black uppercase tracking-widest opacity-80">{item.label}</p>
            <p className="text-5xl font-black mt-3 tabular-nums tracking-tighter">{item.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">This Week</h3>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-3xl font-black text-indigo-600">{weekly.done} <span className="text-sm text-gray-400 font-bold uppercase">Done</span></p>
              <p className="text-sm font-semibold text-gray-500">{weekly.pending} active tasks pending</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Success Rate</p>
              <div className="text-2xl font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl">
                {weekly.rate}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Last 30 Days</h3>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-3xl font-black text-purple-600">{monthly.done} <span className="text-sm text-gray-400 font-bold uppercase">Done</span></p>
              <p className="text-sm font-semibold text-gray-500">{monthly.pending} active tasks pending</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency</p>
              <div className="text-2xl font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-xl">
                {monthly.rate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskHeatmap todos={todos} />

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Growth & Efficiency</h3>
          <p className="text-sm text-gray-500">Long-term performance overview</p>
        </div>
        <AnalyticsChart />
      </div>
    </motion.div>
  );
};

export default Analysis;
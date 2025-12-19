import React from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoItem from '../components/TodoItem';
import { Clock, TrendingUp, CalendarCheck, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Upcoming = () => {
  const { todos } = useTodos();
  const activeTodos = todos.filter(t => !t.archived && !t.completed);

  const today = new Date().toISOString().split('T')[0];
  const nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  const nextSevenDaysISO = nextSevenDays.toISOString().split('T')[0];

  const colorStyles = {
    red: 'border-red-500 text-red-600 dark:text-red-400 bg-red-50/30',
    indigo: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30',
    yellow: 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50/30',
  };

  const sections = [
    {
      title: '🚨 High Priority',
      icon: TrendingUp,
      filter: (t) => t.priority === 'High',
      color: 'red'
    },
    {
      title: '🗓️ Due Today',
      icon: CalendarCheck,
      filter: (t) => t.dueDate === today,
      color: 'indigo' 
    },
    {
      title: '⏳ Upcoming (Next 7 Days)',
      icon: Clock,
      filter: (t) => t.dueDate > today && t.dueDate <= nextSevenDaysISO && t.priority !== 'High',
      color: 'yellow' 
    },
  ];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        /* Changed max-w-6xl to max-w-4xl to prevent the "too big" look */
        className="max-w-4xl mx-auto space-y-6 p-4 md:p-6 pb-20"
    >
      <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-6">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          🕒 What's Next?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Stay ahead of your schedule and priorities.</p>
      </div>
      
      {sections.map(section => {
        const sectionTasks = activeTodos
          .filter(section.filter)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        if (sectionTasks.length === 0) return null;

        return (
          <motion.div 
            key={section.title} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            /* Reduced p-6 to p-5 for a tighter feel */
            className={`group space-y-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-8 hover:shadow-md transition-all duration-300 ${colorStyles[section.color].split(' ')[0]}`}
          >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colorStyles[section.color].split(' ').slice(2).join(' ')}`}>
                        <section.icon className={`w-5 h-5 ${colorStyles[section.color].split(' ')[1]}`} />
                    </div>
                    {section.title}
                </h3>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500 uppercase tracking-wider">
                    {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
                </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence mode="popLayout">
                    {sectionTasks.map(todo => (
                        <motion.div
                            key={todo._id || todo.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ x: 5 }} 
                            className="transition-transform duration-200"
                        >
                            <TodoItem todo={todo} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {activeTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
          >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-inner mb-4">
                <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">All clear!</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">No pending tasks in sight. 🎉</p>
          </motion.div>
      )}
    </motion.div>
  );
};

export default Upcoming;
import React from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoItem from '../components/TodoItem';
import { Clock, TrendingUp, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Upcoming = () => {
  const { todos } = useTodos();
  const activeTodos = todos.filter(t => !t.archived && !t.completed);

  const today = new Date().toISOString().split('T')[0];
  const nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  const nextSevenDaysISO = nextSevenDays.toISOString().split('T')[0];

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
        className="space-y-8"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b pb-2 border-indigo-200 dark:border-gray-700">
        🕒 What's Next?
      </h2>
      
      {sections.map(section => {
        const sectionTasks = activeTodos.filter(section.filter);
        if (sectionTasks.length === 0) return null;

        return (
          <motion.div 
            key={section.title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-t-4 border-${section.color}-500`}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <section.icon className={`w-6 h-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                {section.title}
            </h3>
            
            <div className="space-y-3">
                <AnimatePresence>
                    {sectionTasks.map(todo => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}
                </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {activeTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
              <p className="text-xl font-medium">All clear! No pending tasks in sight. 🎉</p>
          </motion.div>
      )}+
    </motion.div>
  );
};

export default Upcoming;
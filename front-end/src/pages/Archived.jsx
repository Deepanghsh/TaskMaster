import React from 'react';
import { Archive, Trash2, RotateCcw } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Component: ArchivedItem ---
const ArchivedItem = ({ todo, restoreTodo, deleteTodo }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-gray-400 dark:border-gray-600 transition-all hover:shadow-lg"
    >
      <span className="text-base font-medium text-gray-600 dark:text-gray-400 line-through truncate flex-1 mr-4">
          {todo.text}
      </span>
      <div className="flex gap-2 items-center">
        {/* Restore Button */}
        <button
          onClick={() => restoreTodo(todo.id)}
          title="Restore Task"
          className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition-all transform hover:scale-110"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => deleteTodo(todo.id)}
          title="Permanently Delete"
          className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition-all transform hover:scale-110"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
);
// --- End Helper Component ---


const Archived = () => {
  const { todos, restoreTodo, deleteTodo } = useTodos();
  const archivedTodos = todos.filter(t => t.archived);

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b pb-2 border-indigo-200 dark:border-gray-700">
        📦 Archived Tasks
      </h2>

      <div className="space-y-4">
        <AnimatePresence>
            {archivedTodos.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                >
                    <Archive className="w-16 h-16 mx-auto mb-4 opacity-40 text-indigo-500" />
                    <p className="text-xl font-medium">Your archive is empty</p>
                    <p className="text-sm mt-1">Archive tasks from your dashboard to keep things tidy.</p>
                </motion.div>
            ) : (
                archivedTodos.map(todo => (
                    <ArchivedItem 
                        key={todo.id} 
                        todo={todo} 
                        restoreTodo={restoreTodo} 
                        deleteTodo={deleteTodo} 
                    />
                ))
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Archived;
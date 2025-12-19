import React from 'react';
import { Archive, Trash2, RotateCcw, Inbox } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { motion, AnimatePresence } from 'framer-motion';

const Archived = () => {
  const { todos, restoreTodo, deleteTodo } = useTodos();

  const archivedTodos = todos.filter(t => t.archived);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto"
    >
      {/* Updated Header Section */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <Archive className="text-indigo-500 w-8 h-8" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Archived Tasks</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium ml-11">
          {archivedTodos.length === 0 
            ? "Your archive is currently empty" 
            : `Showing ${archivedTodos.length} stored ${archivedTodos.length === 1 ? 'task' : 'tasks'}`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {archivedTodos.length > 0 ? (
            archivedTodos.map(todo => (
              <motion.div
                layout
                key={todo._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col gap-1 mb-3 sm:mb-0">
                  <span className="text-gray-400 dark:text-gray-500 line-through font-medium text-lg decoration-1">
                    {todo.text}
                  </span>
                  {todo.category && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400/70">
                      {todo.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 dark:border-gray-700">
                  <button 
                    onClick={() => restoreTodo(todo._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-105 transition-all font-bold text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>

                  <button 
                    onClick={() => deleteTodo(todo._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:scale-105 transition-all font-bold text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-inner mb-4">
                <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Archive is Empty</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs text-center mt-2 text-sm">
                Old or completed tasks will appear here when you archive them.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Archived;
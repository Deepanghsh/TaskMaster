import React, { useState } from 'react';
import { Check, Edit2, Archive, Trash2, Calendar, Flag, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const priorityColors = {
  Low: 'text-green-600 bg-green-50 dark:bg-green-900/30',
  Medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
  High: 'text-red-600 bg-red-50 dark:bg-red-900/30',
};

const TodoItem = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showRescheduleMenu, setShowRescheduleMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { toggleTodo, deleteTodo, updateTodo, archiveTodo, updateTodoField } = useTodos();
  const { categories } = useCategories();
  const categoryColor = categories.find(c => c.name === todo.category)?.color || '#6366f1';

  const displayDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  
  // Check if task is overdue
  const isOverdue = todo.dueDate && moment(todo.dueDate).isBefore(moment(), 'day') && !todo.completed;

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdate = () => {
    if (editText.trim() && editText !== todo.text) { 
      updateTodo(todo._id, editText);
      showSuccessToast('✅ Task renamed successfully');
    }
    setIsEditing(false);
  };

  const handleReschedule = (days) => {
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');
    updateTodoField(todo._id, 'dueDate', newDate);
    setShowRescheduleMenu(false);
    showSuccessToast('📅 Task rescheduled successfully');
  };

  const handleDelete = () => {
    deleteTodo(todo._id);
    setShowDeleteConfirm(false);
    showSuccessToast('🗑️ Task deleted successfully');
  };

  const handleArchive = () => {
    archiveTodo(todo._id);
    setShowArchiveConfirm(false);
    showSuccessToast('📦 Task archived successfully');
  };

  const rescheduleOptions = [
    { label: 'Today', days: 0, icon: '📅' },
    { label: 'Tomorrow', days: 1, icon: '🌅' },
    { label: 'Next Week', days: 7, icon: '📆' },
    { label: 'Next Month', days: 30, icon: '🗓️' },
  ];

  return (
    <>
      <motion.div layout className="flex items-center gap-4 p-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 group relative" style={{ borderLeftColor: categoryColor }}>
        {/* Checkbox */}
        <button onClick={() => toggleTodo(todo._id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
          {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Task Text */}
        <div className="flex-1">
          {isEditing ? (
            <input value={editText} onChange={e => setEditText(e.target.value)} onBlur={handleUpdate} onKeyDown={e => e.key === 'Enter' && handleUpdate()} className="w-full px-2 py-1 rounded border font-semibold dark:bg-gray-700 dark:text-white" autoFocus />
          ) : (
            <span onClick={() => setIsEditing(true)} className={`cursor-pointer text-base font-semibold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>{todo.text}</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {displayDate && (
            <span className={`text-[12px] font-semibold flex items-center gap-1 px-2 py-1 rounded border ${
              isOverdue 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />{displayDate}
            </span>
          )}
          {todo.priority && (
            <span className={`text-[12px] font-semibold px-2 py-1 rounded flex items-center gap-1 border border-current/10 ${priorityColors[todo.priority]}`}>
              <Flag className="w-3 h-3" />{todo.priority}
            </span>
          )}
        </div>

        {/* Overdue Badge with Reschedule Button */}
        {isOverdue && (
          <div className="relative">
            <button
              onClick={() => setShowRescheduleMenu(!showRescheduleMenu)}
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-1.5"
              title="Reschedule Task"
            >
              <Clock className="w-3.5 h-3.5" />
              Reschedule
            </button>

            {/* Reschedule Menu */}
            <AnimatePresence>
              {showRescheduleMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
                      Reschedule to:
                    </p>
                    {rescheduleOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleReschedule(option.days)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button 
            onClick={() => setIsEditing(true)} 
            className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:scale-105 transition-all"
            title="Edit"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => setShowArchiveConfirm(true)}
            className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40 hover:scale-105 transition-all"
            title="Archive"
          >
            <Archive className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:scale-105 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Click outside to close reschedule menu */}
        {showRescheduleMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowRescheduleMenu(false)}
          />
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Task?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                "{todo.text}"
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Confirmation Modal */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowArchiveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Archive className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Archive Task?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You can restore it later</p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                "{todo.text}"
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Archive
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TodoItem;
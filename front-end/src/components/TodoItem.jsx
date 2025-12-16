import React, { useState } from 'react';
import { Check, Edit2, Archive, Trash2, X, Calendar, Flag } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

const priorityColors = {
    Low: 'text-green-500',
    Medium: 'text-yellow-500',
    High: 'text-red-500',
};

const TodoItem = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { toggleTodo, deleteTodo, updateTodo, archiveTodo, updateTodoField } = useTodos();
  const { categories } = useCategories();

  const categoryColor = categories.find(c => c.name === todo.category)?.color || '#6366f1';
  const categoryBg = `${categoryColor}20`; 
    
  const displayDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  const handleUpdate = () => {
    if (editText.trim()) {
      updateTodo(todo.id, editText);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
      setEditText(todo.text);
      setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 transition-all group min-h-[60px]"
      style={{ borderLeftColor: categoryColor }}
    >
      {/* Checkbox Button */}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 
          ${todo.completed
            ? 'bg-green-500 border-green-500 transform scale-105'
            : 'border-gray-400 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700'
          }`}
        title={todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleUpdate}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
            className="flex-1 px-3 py-1.5 rounded-lg border-2 border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-inner"
            autoFocus
          />
          <button onClick={handleCancelEdit} title="Cancel Edit" className="p-1 text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <span
          className={`flex-1 text-base font-medium transition-colors cursor-pointer ${
            todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'
          }`}
          onClick={() => setIsEditing(true)}
        >
          {todo.text}
        </span>
      )}

      {/* Date and Priority (New Visual Indicators) */}
      <div className='flex gap-2 items-center text-sm flex-shrink-0'>
        {displayDate && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                isOverdue ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
            }`}>
                <Calendar className='w-3 h-3' />
                {displayDate}
            </span>
        )}
        {todo.priority && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${priorityColors[todo.priority]} bg-opacity-10 dark:bg-opacity-20`} style={{backgroundColor: todo.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : todo.priority === 'Medium' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(16, 185, 129, 0.1)'}}>
                <Flag className='w-3 h-3' />
                <span className='hidden sm:inline'>{todo.priority}</span>
            </span>
        )}
      </div>

      {/* Category Tag */}
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 hidden md:inline-block"
        style={{ backgroundColor: categoryBg, color: categoryColor }}
      >
        {todo.category}
      </span>

      {/* Action Buttons */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsEditing(!isEditing)}
          title="Edit Task"
          className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => archiveTodo(todo.id)}
          title="Archive Task"
          className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all"
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          title="Permanently Delete"
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TodoItem;
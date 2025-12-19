import React, { useState } from 'react';
import { Check, Edit2, Archive, Trash2, Calendar, Flag } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

const priorityColors = {
  Low: 'text-green-600 bg-green-50 dark:bg-green-900/30',
  Medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
  High: 'text-red-600 bg-red-50 dark:bg-red-900/30',
};

const TodoItem = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { toggleTodo, deleteTodo, updateTodo, archiveTodo } = useTodos();
  const { categories } = useCategories();
  const categoryColor = categories.find(c => c.name === todo.category)?.color || '#6366f1';

  const displayDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  const handleUpdate = () => {
    if (editText.trim()) { updateTodo(todo._id, editText); }
    setIsEditing(false);
  };

  return (
    <motion.div layout className="flex items-center gap-4 p-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 group" style={{ borderLeftColor: categoryColor }}>
      {/* Checkbox */}
      <button onClick={() => toggleTodo(todo._id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
        {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
      </button>

      {/* Task Text - Semibold for noticeability without being "too bold" */}
      <div className="flex-1">
        {isEditing ? (
          <input value={editText} onChange={e => setEditText(e.target.value)} onBlur={handleUpdate} onKeyDown={e => e.key === 'Enter' && handleUpdate()} className="w-full px-2 py-1 rounded border font-semibold dark:bg-gray-700 dark:text-white" autoFocus />
        ) : (
          <span onClick={() => setIsEditing(true)} className={`cursor-pointer text-base font-semibold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>{todo.text}</span>
        )}
      </div>

      {/* Badges - Balanced padding and font */}
      <div className="flex items-center gap-2">
        {displayDate && (
          <span className="text-[12px] font-semibold flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
            <Calendar className="w-3 h-3" />{displayDate}
          </span>
        )}
        {todo.priority && (
          <span className={`text-[12px] font-semibold px-2 py-1 rounded flex items-center gap-1 border border-current/10 ${priorityColors[todo.priority]}`}>
            <Flag className="w-3 h-3" />{todo.priority}
          </span>
        )}
      </div>

      {/* Action Buttons - Medium Sized (p-2) */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button 
          onClick={() => setIsEditing(true)} 
          className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:scale-105 transition-all"
          title="Edit"
        >
          <Edit2 className="w-4.5 h-4.5" />
        </button>
        
        <button 
          onClick={() => archiveTodo(todo._id)} 
          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40 hover:scale-105 transition-all"
          title="Archive"
        >
          <Archive className="w-4.5 h-4.5" />
        </button>
        
        <button 
          onClick={() => deleteTodo(todo._id)} 
          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:scale-105 transition-all"
          title="Delete"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default TodoItem;
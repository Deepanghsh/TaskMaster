import React, { useState } from 'react';
import { Check, Edit2, Archive, Trash2, X, Calendar, Flag } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

const priorityColors = {
  Low: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  Medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  High: 'text-red-500 bg-red-100 dark:bg-red-900/30',
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
    <motion.div layout className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 group" style={{ borderLeftColor: categoryColor }}>
      <button onClick={() => toggleTodo(todo._id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1">
        {isEditing ? (
          <input value={editText} onChange={e => setEditText(e.target.value)} onBlur={handleUpdate} onKeyDown={e => e.key === 'Enter' && handleUpdate()} className="w-full px-2 py-1 rounded border dark:bg-gray-700 dark:text-white" autoFocus />
        ) : (
          <span onClick={() => setIsEditing(true)} className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : 'dark:text-white'}`}>{todo.text}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {displayDate && <span className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300"><Calendar className="w-3 h-3" />{displayDate}</span>}
        {todo.priority && <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${priorityColors[todo.priority]}`}><Flag className="w-3 h-3" />{todo.priority}</span>}
      </div>

      {/* IMPROVED: Increased gap, individual backgrounds, and hover scale */}
      <div className="flex gap-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-125 transition-all"><Edit2 className="w-4.5 h-4.5" /></button>
        <button onClick={() => archiveTodo(todo._id)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:scale-125 transition-all"><Archive className="w-4.5 h-4.5" /></button>
        <button onClick={() => deleteTodo(todo._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-125 transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
      </div>
    </motion.div>
  );
};

export default TodoItem;
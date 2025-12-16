import React, { useState } from 'react';
import { Plus, Calendar, Flag } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

const priorityOptions = ['Low', 'Medium', 'High'];
const priorityColors = {
    Low: 'text-green-500',
    Medium: 'text-yellow-500',
    High: 'text-red-500',
};

const TodoForm = () => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
    
  const { addTodo } = useTodos();
  const { categories } = useCategories();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text, category, dueDate, priority);
      setText('');
      setDueDate('');
      setPriority('Medium');
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit} 
      className="flex flex-col gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-indigo-100 dark:border-gray-700"
    >
        {/* Row 1: Main Input and Submit */}
        <div className='flex flex-wrap sm:flex-nowrap gap-3'>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 min-w-[150px] px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
            <button
                type="submit"
                title="Add Task"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-xl transform hover:scale-[1.03] active:scale-95 flex items-center justify-center min-w-[50px] sm:min-w-0"
            >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Add</span>
            </button>
        </div>
        
        {/* Row 2: Metadata */}
        <div className='flex flex-wrap gap-3 items-center'>
            {/* Category Select */}
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none text-sm"
            >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.name} className="dark:bg-gray-800">{cat.name}</option>
                ))}
            </select>
            
            {/* Due Date Input */}
            <div className='relative flex items-center min-w-[140px]'>
                <Calendar className='absolute left-3 w-4 h-4 text-gray-400' />
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                    title='Due Date'
                />
            </div>

            {/* Priority Select */}
            <div className='relative flex items-center min-w-[100px]'>
                <Flag className={`absolute left-3 w-4 h-4 ${priorityColors[priority]}`} />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`w-full pl-9 pr-2 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none font-medium text-sm`}
                    style={{ color: priorityColors[priority] }}
                >
                    {priorityOptions.map(opt => (
                        <option key={opt} value={opt} className='dark:bg-gray-800' style={{ color: priorityColors[opt] }}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    </motion.form>
  );
};

export default TodoForm;
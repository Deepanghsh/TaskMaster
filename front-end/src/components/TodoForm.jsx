import React, { useState } from 'react';
import { Plus, Calendar, Flag } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';
import moment from 'moment';

// Define Priority options with explicit colors
const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-300', iconColor: 'text-green-500' },
    { value: 'Medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-700/50 dark:text-amber-300', iconColor: 'text-yellow-500' },
    { value: 'High', label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-700/50 dark:text-red-300', iconColor: 'text-red-500' },
];

// Helper function to capitalize the first letter
const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function TodoForm({ defaultPriority = 'Low' }) {
    const { addTodo } = useTodos();
    const { categories } = useCategories(); 
    
    // Fallback category list if hook returns null/empty
    const defaultCategoryOptions = [{ id: 'g', name: 'general', colorTailwind: 'bg-gray-500' }];
    const categoryOptions = (categories && categories.length > 0) ? categories : defaultCategoryOptions;
    
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState(defaultPriority);
    const [category, setCategory] = useState(categoryOptions[0].name); 
    
    const [errors, setErrors] = useState({});

    // --- Validation Logic ---
    const validate = (field, value, currentState) => {
        const newErrors = { ...errors };
        const today = moment().startOf('day');

        const currentText = field === 'text' ? value : currentState.text;
        const currentDueDate = field === 'dueDate' ? value : currentState.dueDate;

        let isValid = true;

        if (field === 'text' || field === 'all') {
            if (!currentText.trim()) {
                newErrors.text = 'Task name is mandatory.';
                isValid = false;
            } else {
                delete newErrors.text;
            }
        }

        if (field === 'dueDate' || field === 'all') {
            if (!currentDueDate) {
                newErrors.dueDate = 'Due date is mandatory.';
                isValid = false;
            } else {
                const selectedDate = moment(currentDueDate, "YYYY-MM-DD").startOf('day');
                
                if (selectedDate.isBefore(today)) {
                    newErrors.dueDate = 'Due date must be today or a future date.';
                    isValid = false;
                } else {
                    delete newErrors.dueDate;
                }
            }
        }
        
        setErrors(newErrors);
        return isValid && Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const currentState = { text, dueDate, errors };
        const formIsValid = validate('all', null, currentState);

        if (formIsValid) {
            // Passing all required arguments, including the new optional description
            addTodo(text, category, dueDate, priority, description);

            // Reset state on success
            setText('');
            setDescription('');
            setDueDate('');
            setPriority(defaultPriority);
            setCategory(categoryOptions[0].name); 
            setErrors({}); 
        }
    };
    
    const handleTextChange = (e) => {
        const value = e.target.value;
        setText(value);
        validate('text', value, { text: value, dueDate, errors });
    };

    const handleDateChange = (e) => {
        const value = e.target.value;
        setDueDate(value);
        validate('dueDate', value, { text, dueDate: value, errors });
    };

    // Consolidated check for button state
    const hasCurrentErrors = Object.keys(errors).length > 0;
    const isReadyForSubmission = text.trim() && dueDate && !hasCurrentErrors;

    const selectedPriorityData = priorityOptions.find(p => p.value === priority) || priorityOptions[0];
    const selectedCategoryData = categoryOptions.find(c => c.name === category) || defaultCategoryOptions[0];
    
    return (
        <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* 1. TASK NAME INPUT */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={text}
                    onChange={handleTextChange}
                    className={`w-full p-3 border rounded-xl text-sm transition shadow-sm
                        ${errors.text ? 'border-red-500 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'}
                        dark:bg-gray-700 dark:text-gray-100`}
                />
                {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
            </div>

            {/* 1b. OPTIONAL DESCRIPTION TEXTAREA */}
            <div className="relative">
                <textarea
                    placeholder="Optional description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm transition shadow-sm dark:bg-gray-700 dark:text-gray-100 resize-none"
                />
            </div>


            {/* 2. DUE DATE INPUT */}
            <div className="relative flex items-center">
                <Calendar className='absolute left-3 w-4 h-4 text-gray-400' />
                <input
                    type="date"
                    value={dueDate}
                    min={moment().format("YYYY-MM-DD")} 
                    onChange={handleDateChange} 
                    className={`w-full p-3 pl-9 h-[48px] border rounded-xl text-sm shadow-sm text-gray-700 dark:text-gray-100 appearance-none
                        ${errors.dueDate ? 'border-red-500 ring-red-500' : 'border-gray-200 dark:border-gray-700'}
                        dark:bg-gray-700`}
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            {/* 3. CONTROLS ROW (Category & Priority) */}
            <div className="flex items-center gap-3">
                
                {/* Category Dropdown */}
                <div className='relative flex-1'>
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${selectedCategoryData.colorTailwind || 'bg-gray-500'}`}></span>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 w-full p-3 pl-9 h-[48px] border border-gray-300 rounded-xl text-sm font-medium shadow-sm appearance-none cursor-pointer text-gray-700
                            bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        {categoryOptions.map(cat => (
                            <option key={cat.id || cat.name} value={cat.name}>
                                {capitalize(cat.name)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Dropdown */}
                <div className='relative flex-1'>
                    <Flag className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${selectedPriorityData.iconColor}`} />
                    <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)}
                        className={`w-full p-3 pl-9 h-[48px] border border-transparent rounded-xl text-sm font-semibold appearance-none cursor-pointer transition 
                            ${selectedPriorityData.color} ${selectedPriorityData.bg}`}
                    >
                        {priorityOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className='text-gray-900 dark:text-gray-100'> 
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ADD BUTTON - FINAL FIX */}
            <motion.button
                type="submit"
                disabled={!isReadyForSubmission}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                // FIX: Ensure 'flex items-center justify-center' for icon/text alignment
                // FIX: Ensure shadow-lg is present in BOTH states for consistent height
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center
                    ${!isReadyForSubmission
                        ? 'bg-indigo-400 cursor-not-allowed shadow-indigo-300/50'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}
                `}
            >
                <Plus className="w-5 h-5 mr-2" /> 
                Add Task
            </motion.button>
        </motion.form>
    );
}
import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { motion } from 'framer-motion';

const CalendarView = ({ todos }) => {
    const { categories } = useCategories();
    // Helper to get category color
    const getCategoryColor = (name) => categories.find(c => c.name === name)?.color || '#6366f1';
    
    // Filter tasks that have a date and are not completed/archived
    const tasksWithDates = todos.filter(t => t.dueDate && !t.completed && !t.archived);
    
    // Group tasks by date
    const groupedTasks = tasksWithDates.reduce((acc, task) => {
        const date = task.dueDate; // YYYY-MM-DD
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});
    
    // --- Mock Calendar Data ---
    // In a real app, you would dynamically generate this grid for the current month
    const today = new Date().toISOString().split('T')[0];
    
    // Example grid generation (Dec 2025 starts on a Monday)
    const mockDates = [];
    const startDate = new Date('2025-11-30'); // Start grid on a Sunday for alignment
    startDate.setDate(startDate.getDate() - 6); // Backtrack to fill week
    
    for (let i = 0; i < 42; i++) { // Generate 6 weeks (42 days)
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        mockDates.push(date.toISOString().split('T')[0]);
    }
    // --- End Mock Calendar Data ---

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Monthly Task Overview
            </h3>
            
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400 border-b pb-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {mockDates.map(date => {
                    const tasks = groupedTasks[date] || [];
                    const isToday = date === today;
                    const cellTasks = tasks.slice(0, 2); // Show max 2 tasks
                    
                    return (
                        <div key={date} 
                            className={`p-1 h-28 rounded-lg flex flex-col items-start justify-start transition-all cursor-pointer border border-gray-100 dark:border-gray-700/50 
                                             ${isToday ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            
                            <span className={`text-sm font-bold w-full text-right pr-1 ${isToday ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                                {new Date(date).getDate()}
                            </span>
                            
                            <div className="mt-1 space-y-0.5 w-full">
                                {cellTasks.map((task, index) => (
                                    <div key={index} 
                                         className="w-full text-xs truncate px-1 rounded-sm text-white font-medium" 
                                         style={{ backgroundColor: getCategoryColor(task.category) }}>
                                        {task.text.split(' ')[0]}...
                                    </div>
                                ))}
                                {tasks.length > 2 && (
                                    <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        +{tasks.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {tasksWithDates.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                    <p>No tasks with due dates found.</p>
                </div>
            )}
        </motion.div>
    );
};

export default CalendarView;
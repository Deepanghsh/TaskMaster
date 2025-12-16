import React from 'react';
import { useTodos } from '../hooks/useTodos';
import CalendarView from '../components/CalendarView';
import { motion } from 'framer-motion';

const CalendarPage = () => { // <-- FIXED COMPONENT NAME
    const { todos } = useTodos();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b pb-2 border-indigo-200 dark:border-gray-700">
                🗓️ Task Calendar
            </h2>
            
            <CalendarView todos={todos} />
        </motion.div>
    );
};

export default CalendarPage;
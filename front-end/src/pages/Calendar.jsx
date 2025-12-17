import React, { useState, useMemo } from 'react';
import { useTodos } from '../hooks/useTodos';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const generateMonthDays = (date) => {
    const startOfMonth = moment(date).startOf('month');
    const endOfMonth = moment(date).endOf('month');
    const startOfWeek = moment(startOfMonth).startOf('week');
    const endOfWeek = moment(endOfMonth).endOf('week');

    const days = [];
    let day = startOfWeek;

    while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
        days.push(moment(day));
        day.add(1, 'day');
    }
    return days;
};

export default function Calendar() {
    const { todos } = useTodos();
    const [currentMonth, setCurrentMonth] = useState(moment()); 
    const [selectedDate, setSelectedDate] = useState(null);

    const allDays = useMemo(() => generateMonthDays(currentMonth), [currentMonth]);
    
    const tasksByDate = useMemo(() => {
        return todos.filter(t => t.dueDate && !t.archived).reduce((acc, todo) => {
            const dateKey = moment(todo.dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            // Ensure description is included in todo object if your context returns it
            acc[dateKey].push(todo);
            return acc;
        }, {});
    }, [todos]);
    
    const detailTasks = selectedDate 
        ? tasksByDate[selectedDate.format('YYYY-MM-DD')] || []
        : [];

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => moment(prevMonth).subtract(1, 'month'));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => moment(prevMonth).add(1, 'month'));
        setSelectedDate(null);
    };

    const handleDayClick = (day) => {
        if (selectedDate && selectedDate.isSame(day, 'day')) {
            setSelectedDate(null);
        } else {
            setSelectedDate(day);
        }
    };

    const daysOfWeek = moment.weekdaysShort();

    return (
        <div className="w-full mx-auto space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center border-b pb-3">
                <CalendarIcon className="w-8 h-8 mr-3 text-indigo-600" />
                Interactive Calendar
            </h1>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
                <button 
                    onClick={goToPreviousMonth} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    title="Previous Month"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentMonth.format('MMMM YYYY')}
                </h2>
                <button 
                    onClick={goToNextMonth} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    title="Next Month"
                >
                    <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-bold text-sm py-2 text-indigo-600 dark:text-indigo-400 border-b border-indigo-200 dark:border-indigo-800">
                        {day}
                    </div>
                ))}

                {allDays.map((day, index) => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const isToday = day.isSame(moment(), 'day');
                    const isOtherMonth = !day.isSame(currentMonth, 'month');
                    const isSelected = selectedDate && selectedDate.isSame(day, 'day');
                    const taskCount = tasksByDate[dateKey] ? tasksByDate[dateKey].length : 0;
                    
                    let cellClasses = 'h-14 p-2 flex flex-col items-center justify-start rounded-lg transition duration-200 cursor-pointer text-sm';

                    if (isOtherMonth) {
                        cellClasses += ' text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-700 pointer-events-none';
                    } else if (isSelected) {
                        cellClasses += ' bg-indigo-600 text-white font-bold shadow-lg ring-2 ring-indigo-400 z-10';
                    } else if (isToday) {
                        cellClasses += ' bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold border-2 border-indigo-500';
                    } else {
                        cellClasses += ' text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700';
                    }

                    return (
                        <div 
                            key={index} 
                            className={cellClasses}
                            onClick={() => handleDayClick(day)}
                            title={taskCount > 0 ? `${taskCount} task(s) due` : 'No tasks due'}
                        >
                            <span className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                                {day.format('D')}
                            </span>
                            {taskCount > 0 && (
                                <span className={`mt-0.5 text-xs w-4 h-4 rounded-full flex items-center justify-center 
                                    ${taskCount > 2 ? 'bg-red-500' : taskCount > 0 ? 'bg-amber-500' : 'bg-green-500'}
                                    ${isSelected ? 'text-white' : 'text-white'} 
                                    font-bold`}>
                                    {taskCount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="mt-6 p-5 border-t-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                            Tasks for {selectedDate.format('dddd, MMM D, YYYY')}
                        </h3>
                        <button 
                            onClick={() => setSelectedDate(null)} 
                            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition"
                            title="Close Details"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {detailTasks.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">
                            No tasks are due on this date. Enjoy the break!
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {detailTasks.map((task, index) => (
                                <li 
                                    key={index} 
                                    className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col justify-start border-l-4 border-indigo-400"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-gray-800 dark:text-gray-100">{task.text}</span>
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-200 text-red-800' : task.priority === 'Medium' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {task.category}
                                            </span>
                                        </div>
                                    </div>
                                    {/* NEW: Display Task Description */}
                                    {task.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 pr-10">
                                            {task.description}
                                        </p>
                                    )}
                                    {!task.description && (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-1 pr-10">
                                            No description provided.
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
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
        // Filter: Hide completed tasks. Archive allowed if not completed.
        return todos.filter(t => t.dueDate && !t.completed).reduce((acc, todo) => {
            const dateKey = moment(todo.dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(todo);

            // Sort: High > Medium > Low
            acc[dateKey].sort((a, b) => {
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
            });

            return acc;
        } , {});
    }, [todos]);
    
    const detailTasks = selectedDate 
        ? tasksByDate[selectedDate.format('YYYY-MM-DD')] || []
        : [];

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => moment(prevMonth).subtract(1, 'month'));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth).add(1, 'month');
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

            {/* Navigation */}
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
                <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentMonth.format('MMMM YYYY')}
                </h2>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-bold text-sm py-2 text-indigo-600 dark:text-indigo-400 border-b border-indigo-200 dark:border-indigo-800 uppercase tracking-tighter">
                        {day}
                    </div>
                ))}

                {allDays.map((day, index) => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const isToday = day.isSame(moment(), 'day');
                    const isOtherMonth = !day.isSame(currentMonth, 'month');
                    const isSelected = selectedDate && selectedDate.isSame(day, 'day');
                    const tasks = tasksByDate[dateKey] || [];
                    const taskCount = tasks.length;
                    
                    // Priority Logic
                    const hasHigh = tasks.some(t => t.priority === 'High');
                    const hasMedium = tasks.some(t => t.priority === 'Medium');

                    // Determine Badge Color
                    let badgeColor = 'bg-emerald-500'; // Default Green (Low)
                    if (hasHigh) badgeColor = 'bg-red-500';
                    else if (hasMedium) badgeColor = 'bg-orange-500';
                    
                    let cellClasses = 'min-h-[100px] p-2 flex flex-col items-center justify-start rounded-lg transition duration-200 cursor-pointer text-sm relative border';

                    if (isOtherMonth) {
                        cellClasses += ' text-gray-300 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/50 pointer-events-none opacity-40';
                    } else if (isSelected) {
                        cellClasses += ' bg-indigo-600 text-white font-bold shadow-lg ring-2 ring-indigo-400 z-10';
                    } else if (isToday) {
                        cellClasses += ' bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 font-semibold border-2 border-indigo-500';
                    } else {
                        cellClasses += ' text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700';
                    }

                    return (
                        <div key={index} className={cellClasses} onClick={() => handleDayClick(day)}>
                            <div className="flex justify-between w-full mb-1 relative">
                                {hasHigh && !isOtherMonth && (
                                    <div className="absolute top-0 left-0">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-sm shadow-red-500/50"></span>
                                        </span>
                                    </div>
                                )}
                                <span className={`font-bold ml-auto ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {day.format('D')}
                                </span>
                            </div>

                            {/* Badge with Dynamic Priority Color */}
                            <div className="w-full mt-auto flex justify-center pb-2">
                                {taskCount > 0 && !isOtherMonth && (
                                    <div className={`text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black text-white shadow-md transition-all ${badgeColor}`}>
                                        {taskCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Details Section */}
            {selectedDate && (
                <div className="mt-6 p-5 border-t-2 border-indigo-200 dark:border-indigo-700 bg-gray-50 dark:bg-gray-900/40 rounded-xl shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                            Tasks for {selectedDate.format('dddd, MMM D, YYYY')}
                        </h3>
                        <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {detailTasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 italic">No pending tasks for this date.</p>
                    ) : (
                        <ul className="space-y-3">
                            {detailTasks.map((task, index) => (
                                <li key={index} className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col border-l-4 ${task.priority === 'High' ? 'border-red-500' : task.priority === 'Medium' ? 'border-orange-500' : 'border-emerald-500'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white tracking-tight">{task.text}</span>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest 
                                            ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                              task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                                              'bg-emerald-100 text-emerald-800'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{task.description}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
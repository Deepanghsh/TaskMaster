import React, { useState, useMemo } from 'react';
import { useTodos } from '../hooks/useTodos';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, ListTodo } from 'lucide-react';

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
        return todos.filter(t => t.dueDate && !t.completed).reduce((acc, todo) => {
            const dateKey = moment(todo.dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(todo);

            acc[dateKey].sort((a, b) => {
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
            });

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
        // Adjusted main background to be darker (gray-100 / gray-950) so white cards pop
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-6 transition-colors duration-300">
            <div className={`mx-auto flex flex-col lg:flex-row gap-6 transition-all duration-500 ease-in-out ${selectedDate ? 'max-w-[1600px]' : 'max-w-6xl'}`}>
                
                {/* CALENDAR SECTION */}
                <div className="flex-grow bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-5 md:p-8">
                        {/* Header */}
                        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
                                <CalendarIcon className="w-7 h-7 mr-3 text-indigo-600" />
                                Interactive Calendar
                            </h1>

                            {/* Navigation */}
                            <div className="flex items-center space-x-4 bg-gray-200/50 dark:bg-gray-800 p-1.5 rounded-2xl">
                                <button onClick={goToPreviousMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-95">
                                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                </button>
                                <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
                                    {currentMonth.format('MMMM YYYY')}
                                </h2>
                                <button onClick={goToNextMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-95">
                                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                </button>
                            </div>
                        </header>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-3">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center font-bold text-[10px] py-2 text-gray-400 dark:text-gray-500 uppercase tracking-widest">
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

                                const hasHigh = tasks.some(t => t.priority === 'High');
                                const hasMedium = tasks.some(t => t.priority === 'Medium');

                                let badgeColor = 'bg-emerald-500';
                                if (hasHigh) badgeColor = 'bg-red-500';
                                else if (hasMedium) badgeColor = 'bg-orange-500';

                                // Define Classes for separation
                                let cellClasses = 'min-h-[90px] md:min-h-[105px] p-2 md:p-3 flex flex-col rounded-2xl transition-all duration-300 cursor-pointer relative border ';

                                if (isOtherMonth) {
                                    cellClasses += 'text-gray-300 dark:text-gray-700 bg-transparent border-transparent opacity-10 pointer-events-none';
                                } else if (isSelected) {
                                    cellClasses += 'bg-indigo-600 border-indigo-600 text-white shadow-lg z-10 scale-[1.02]';
                                } else if (isToday) {
                                    // High contrast for Today
                                    cellClasses += 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 shadow-md ring-1 ring-indigo-500/20';
                                } else {
                                    // High contrast for regular days: Pure white on Gray bg
                                    cellClasses += 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500 hover:-translate-y-0.5';
                                }

                                return (
                                    <div key={index} className={cellClasses} onClick={() => handleDayClick(day)}>
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm md:text-base font-bold ${isSelected ? 'text-white' : 'text-inherit'}`}>
                                                {day.format('D')}
                                            </span>
                                            {hasHigh && !isOtherMonth && !isSelected && (
                                                <span className="flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex justify-end">
                                            {taskCount > 0 && !isOtherMonth && (
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm ${isSelected ? 'bg-white/20' : badgeColor}`}>
                                                    {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SIDE TASK PANEL */}
                {selectedDate && (
                    <aside className="w-full lg:w-[400px] shrink-0 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 h-full flex flex-col max-h-[calc(100vh-100px)] lg:sticky lg:top-6">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                        {selectedDate.format('MMM D, YYYY')}
                                    </h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                                        {selectedDate.format('dddd')} Overview
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDate(null)} 
                                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:text-red-500 transition-all hover:rotate-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6">
                                {detailTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                            <ListTodo className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 italic">No tasks for this day.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {detailTasks.map((task, index) => (
                                            <li key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                        {task.text}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider 
                                                        ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                                                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                                                          'bg-emerald-100 text-emerald-600'}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 font-medium">TaskMaster • {detailTasks.length} items</p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
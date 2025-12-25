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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-3 md:p-4 lg:p-6 transition-colors duration-300">
            <div className={`mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 transition-all duration-500 ease-in-out ${selectedDate ? 'max-w-[1400px]' : 'max-w-5xl'}`}>
                
                {/* CALENDAR SECTION */}
                <div className="flex-grow bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 md:p-6 lg:p-8">
                        {/* Header */}
                        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
                                <CalendarIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3 text-indigo-600" />
                                Interactive Calendar
                            </h1>

                            {/* Navigation */}
                            <div className="flex items-center space-x-3 bg-gray-200/50 dark:bg-gray-800 p-1.5 rounded-2xl">
                                <button onClick={goToPreviousMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-95">
                                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200" />
                                </button>
                                <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 min-w-[120px] md:min-w-[140px] text-center">
                                    {currentMonth.format('MMMM YYYY')}
                                </h2>
                                <button onClick={goToNextMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-95">
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200" />
                                </button>
                            </div>
                        </header>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1.5 md:gap-2 lg:gap-3">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center font-bold text-[9px] md:text-[10px] py-1.5 md:py-2 text-gray-400 dark:text-gray-500 uppercase tracking-widest">
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

                                let cellClasses = 'min-h-[65px] sm:min-h-[75px] md:min-h-[85px] lg:min-h-[95px] p-1.5 md:p-2 lg:p-3 flex flex-col rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer relative border ';

                                if (isOtherMonth) {
                                    cellClasses += 'text-gray-300 dark:text-gray-700 bg-transparent border-transparent opacity-10 pointer-events-none';
                                } else if (isSelected) {
                                    cellClasses += 'bg-indigo-600 border-indigo-600 text-white shadow-lg z-10 scale-[1.02]';
                                } else if (isToday) {
                                    cellClasses += 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 shadow-md ring-1 ring-indigo-500/20';
                                } else {
                                    cellClasses += 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500 hover:-translate-y-0.5';
                                }

                                return (
                                    <div key={index} className={cellClasses} onClick={() => handleDayClick(day)}>
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs md:text-sm font-bold ${isSelected ? 'text-white' : 'text-inherit'}`}>
                                                {day.format('D')}
                                            </span>
                                            {hasHigh && !isOtherMonth && !isSelected && (
                                                <span className="flex h-1.5 w-1.5 md:h-2 md:w-2">
                                                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex justify-end">
                                            {taskCount > 0 && !isOtherMonth && (
                                                <div className={`text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-bold text-white shadow-sm ${isSelected ? 'bg-white/20' : badgeColor}`}>
                                                    {taskCount}
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
                    <aside className="w-full lg:w-[350px] xl:w-[400px] shrink-0 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 h-full flex flex-col max-h-[600px] lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-6">
                            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">
                                        {selectedDate.format('MMM D, YYYY')}
                                    </h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                                        {selectedDate.format('dddd')} Overview
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDate(null)} 
                                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:text-red-500 transition-all hover:rotate-90"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 md:p-6">
                                {detailTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                            <ListTodo className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No tasks for this day.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3 md:space-y-4">
                                        {detailTasks.map((task, index) => (
                                            <li key={index} className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                        {task.text}
                                                    </span>
                                                    <span className={`text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg uppercase tracking-wider 
                                                        ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                                                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                                                          'bg-emerald-100 text-emerald-600'}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-3 md:p-4 bg-gray-50/50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[9px] md:text-[10px] text-gray-400 font-medium">TaskMaster • {detailTasks.length} items</p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
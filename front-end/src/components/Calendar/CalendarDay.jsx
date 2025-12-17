import React from 'react';
import TaskIndicator from './TaskIndicator';

export default function CalendarDay({ day, tasks, onTaskClick }) {
    const { dateObject, isCurrentMonth, isToday } = day;

    const baseClasses = "relative p-2 h-28 border border-gray-200 dark:border-gray-700 overflow-y-auto transition-colors duration-200";
    const todayClasses = isToday ? "bg-indigo-50 dark:bg-indigo-900/50" : "hover:bg-gray-50 dark:hover:bg-gray-800/70";
    const nonMonthClasses = isCurrentMonth ? "" : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
    
    const dayNumberClasses = isToday 
        ? "w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold" 
        : "text-gray-900 dark:text-gray-200";

    return (
        <div className={`${baseClasses} ${todayClasses} ${nonMonthClasses}`}>
            {/* Day Number */}
            <div className={`absolute top-1 right-1 ${dayNumberClasses}`}>
                {dateObject.getDate()}
            </div>

            {/* Task Indicators */}
            <div className="mt-6 space-y-1">
                {tasks.slice(0, 2).map(task => ( // Show max 2 tasks, use logic for "more" if necessary
                    <TaskIndicator 
                        key={task.id} 
                        task={task} 
                        onTaskClick={onTaskClick}
                    />
                ))}
                {tasks.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 cursor-pointer hover:underline">
                        +{tasks.length - 2} more tasks
                    </div>
                )}
            </div>
        </div>
    );
}
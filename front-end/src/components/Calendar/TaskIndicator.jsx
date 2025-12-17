// src/components/Calendar/TaskIndicator.jsx
import React from 'react';
import { useCategories } from '../../hooks/useCategories';

/**
 * Renders a small, color-coded badge for a task within the calendar cell.
 */
export default function TaskIndicator({ task, onTaskClick }) {
    const { getCategoryColor } = useCategories();
    const color = getCategoryColor(task.category);

    return (
        <div 
            className="flex items-center text-xs space-x-1 cursor-pointer truncate rounded-md px-1 py-0.5"
            style={{ 
                backgroundColor: color + '20', // Light background shade
                color: color, 
                borderColor: color 
            }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent the day cell click handler from running
                onTaskClick(task);
            }}
            title={task.text}
        >
            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }}></span>
            <span className="truncate">{task.text}</span>
        </div>
    );
}
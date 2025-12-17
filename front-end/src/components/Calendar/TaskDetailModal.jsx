import React from 'react';
import { format } from 'date-fns';
import { useCategories } from '../../hooks/useCategories';

export default function TaskDetailModal({ task, onClose }) {
    const { getCategoryColor } = useCategories();
    if (!task) return null;

    const categoryColor = getCategoryColor(task.category);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm p-6 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{task.text}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Due Date */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                            {format(new Date(task.dueDate), 'PPP')}
                        </span>
                    </div>

                    {/* Priority */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                        <span className={`font-semibold text-white px-2 py-0.5 rounded-full text-xs`}
                            style={{ backgroundColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}
                        >
                            {task.priority}
                        </span>
                    </div>

                    {/* Category */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="font-medium px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {task.category}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${task.completed ? 'text-green-500' : 'text-red-500'}`}>
                            {task.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={onClose} 
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
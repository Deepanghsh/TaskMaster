import React from 'react';
import { useTodos } from '../hooks/useTodos';

const ProgressBar = () => {
  const { todos } = useTodos();
  const activeTodos = todos.filter(t => !t.archived);
  const completedCount = activeTodos.filter(t => t.completed).length;
  const totalCount = activeTodos.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Dynamic gradient logic based on progress
  const getProgressColor = () => {
    if (percentage < 33) return 'from-red-500 to-orange-500';
    if (percentage < 66) return 'from-orange-400 to-yellow-400';
    return 'from-yellow-400 to-green-500';
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-200">Progress</span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
        {completedCount} of {totalCount} tasks completed
      </div>
    </div>
  );
};

export default ProgressBar;
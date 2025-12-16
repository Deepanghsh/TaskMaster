import React from 'react';
import { useTodos } from '../hooks/useTodos';

const ProgressBar = () => {
  const { todos } = useTodos();
  const activeTodos = todos.filter(t => !t.archived);
  const completedCount = activeTodos.filter(t => t.completed).length;
  const totalCount = activeTodos.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-2 text-white">
        <span className="font-medium">Progress</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-white/90 text-sm">
        {completedCount} of {totalCount} tasks completed
      </div>
    </div>
  );
};

export default ProgressBar;
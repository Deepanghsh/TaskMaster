import React from 'react';
import { useTodos } from '../hooks/useTodos';
import AnalyticsChart from '../components/AnalyticsChart';

const Analysis = () => {
  const { todos } = useTodos();

  const activeTodos = todos.filter(t => !t.archived);
  const completed = activeTodos.filter(t => t.completed).length;
  const pending = activeTodos.filter(t => !t.completed).length;
  const total = activeTodos.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productivity Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90">Total Tasks</p>
          <p className="text-4xl font-bold mt-2">{total}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90">Completed</p>
          <p className="text-4xl font-bold mt-2">{completed}</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white">
          <p className="text-sm font-medium opacity-90">Pending</p>
          <p className="text-4xl font-bold mt-2">{pending}</p>
        </div>
      </div>

      <AnalyticsChart />
    </div>
  );
};

export default Analysis;
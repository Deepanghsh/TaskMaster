import React from 'react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';

const AnalyticsChart = () => {
  const { todos } = useTodos();
  const { categories } = useCategories();

  const activeTodos = todos.filter(t => !t.archived);

  const categoryStats = categories.map(cat => ({
    name: cat.name,
    color: cat.color,
    count: activeTodos.filter(t => t.category === cat.name).length,
    completed: activeTodos.filter(t => t.category === cat.name && t.completed).length
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
      <div className="space-y-4">
        {categoryStats.map(stat => (
          <div key={stat.name}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{stat.name}</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stat.completed}/{stat.count}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${stat.count > 0 ? (stat.completed / stat.count) * 100 : 0}%`,
                  backgroundColor: stat.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
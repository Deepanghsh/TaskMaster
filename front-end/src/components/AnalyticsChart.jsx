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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-2">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 px-2">
        Tasks by Category
      </h3>
      
      {/* Grid Container: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map(stat => (
          <div 
            key={stat.name} 
            className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: stat.color }} 
                />
                <span className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                  {stat.name}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {stat.completed}/{stat.count}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${stat.count > 0 ? (stat.completed / stat.count) * 100 : 0}%`,
                  backgroundColor: stat.color,
                  boxShadow: `0 0 8px ${stat.color}40` // Subtle glow effect
                }}
              />
            </div>
            
            {/* Percentage Label */}
            <div className="mt-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              {stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0}% Done
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
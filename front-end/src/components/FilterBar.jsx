import React from 'react';
import { Search, X, Calendar, RotateCcw } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const FilterBar = ({ 
  filter, 
  setFilter, 
  search, 
  setSearch, 
  categoryFilter, 
  setCategoryFilter,
  dueDateFilter,
  setDueDateFilter 
}) => {
  const { categories } = useCategories();

  // Clear all filters
  const clearAllFilters = () => {
    setFilter('all');
    setSearch('');
    setCategoryFilter('all');
    if (setDueDateFilter) setDueDateFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters = filter !== 'all' || search !== '' || categoryFilter !== 'all' || (dueDateFilter && dueDateFilter !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters Row - Responsive Grid */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              filter === 'active'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            Active
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              filter === 'completed'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border-none bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm outline-none cursor-pointer shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors capitalize"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id} className="capitalize">
              {cat.name}
            </option>
          ))}
        </select>

        {/* Due Date Filter (conditionally rendered) */}
        {setDueDateFilter && (
          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border-none bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm outline-none cursor-pointer shadow-sm hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="no-date">No Due Date</option>
          </select>
        )}

        {/* Clear All Button - Only show if filters are active */}
        {hasActiveFilters && (
          <>
            <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
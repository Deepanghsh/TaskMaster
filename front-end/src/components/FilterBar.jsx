import React from 'react';
import { Search, X } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const FilterBar = ({ filter, setFilter, search, setSearch, categoryFilter, setCategoryFilter }) => {
  const { categories } = useCategories();

  return (
    <div className="flex flex-wrap gap-3 mb-6 items-center">
      {/* Search Input with Clear Option */}
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
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

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
          }`}
        >
          All
        </button>
        
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === 'active'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
          }`}
        >
          Active
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === 'completed'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Colored Category Dropdown with Capitalization */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="px-4 py-2 rounded-lg border-none bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-bold outline-none cursor-pointer shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors capitalize"
      >
        <option value="all" className="capitalize">All Categories</option>
        {categories.map(cat => (
          <option 
            key={cat.id || cat.name} 
            value={cat.name} 
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white capitalize"
          >
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
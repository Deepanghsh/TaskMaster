import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Calendar, RotateCcw, ChevronDown } from 'lucide-react';

// Mock categories for demo
const mockCategories = [
  { _id: 'cat1', name: 'design', color: '#FF6B6B' },
  { _id: 'cat2', name: 'dev', color: '#4ECDC4' },
  { _id: 'cat3', name: 'general', color: '#95E1D3' },
  { _id: 'cat4', name: 'home', color: '#FFD93D' },
  { _id: 'cat5', name: 'nchieib', color: '#A8E6CF' }
];

const FilterBar = ({ 
  filter = 'all', 
  setFilter, 
  search = '', 
  setSearch, 
  categoryFilter = 'all', 
  setCategoryFilter,
  dueDateFilter = 'all',
  setDueDateFilter 
}) => {
  const categories = mockCategories; // Replace with: const { categories } = useCategories();
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const categoryRef = useRef(null);
  const dateRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear all filters
  const clearAllFilters = () => {
    setFilter('all');
    setSearch('');
    setCategoryFilter('all');
    if (setDueDateFilter) setDueDateFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters = filter !== 'all' || search !== '' || categoryFilter !== 'all' || (dueDateFilter && dueDateFilter !== 'all');

  // Get selected category name
  const selectedCategory = categories.find(cat => cat._id === categoryFilter);
  const categoryButtonText = selectedCategory ? selectedCategory.name : 'All Categories';

  // Get selected date filter text
  const dateFilterOptions = {
    'all': 'All Dates',
    'overdue': 'Overdue',
    'today': 'Due Today',
    'tomorrow': 'Due Tomorrow',
    'week': 'This Week',
    'month': 'This Month',
    'no-date': 'No Due Date'
  };

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
          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter Buttons */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('active')}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              filter === 'active'
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-emerald-600'
            }`}
          >
            Active
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

        {/* Category Filter Dropdown */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm outline-none cursor-pointer shadow-sm transition-all duration-200 flex items-center gap-2 capitalize ${
              categoryFilter !== 'all'
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
          >
            <span>{categoryButtonText}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setShowCategoryDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                  categoryFilter === 'all' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                All Categories
              </button>
              
              <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setCategoryFilter(cat._id);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors capitalize flex items-center gap-2 ${
                    categoryFilter === cat._id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Due Date Filter Dropdown */}
        {setDueDateFilter && (
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm outline-none cursor-pointer shadow-sm transition-all duration-200 flex items-center gap-2 ${
                dueDateFilter !== 'all'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{dateFilterOptions[dueDateFilter]}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDateDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 py-2 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {Object.entries(dateFilterOptions).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDueDateFilter(value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${
                      dueDateFilter === value ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <>
            <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center gap-2 shadow-sm hover:scale-105"
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
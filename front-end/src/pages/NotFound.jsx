import React from 'react';

const NotFound = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
      >
        Go back to Home
      </button>
    </div>
  );
};

export default NotFound;
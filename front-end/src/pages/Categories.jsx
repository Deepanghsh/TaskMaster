import React from 'react';
import CategoryList from '../components/CategoryList';

const Categories = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
      <CategoryList />
    </div>
  );
};

export default Categories;
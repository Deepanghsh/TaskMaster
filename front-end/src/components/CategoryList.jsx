import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const CategoryList = () => {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addCategory(name, color);
      setName('');
      setColor('#6366f1');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
        >
          Add
        </button>
      </form>

      <div className="grid gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
            </div>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
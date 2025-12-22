import React, { useState } from 'react';
import { Trash2, Plus, Check, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../hooks/useCategories';

const CategoryList = () => {
  const { categories, addCategory, deleteCategory, loading } = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addCategory(name.toLowerCase(), color);
      setName('');
      setColor('#6366f1');
    }
  };

  const handleConfirmDelete = (id) => {
    deleteCategory(id);
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleAdd} className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border dark:border-slate-700">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Label..."
          className="flex-1 bg-transparent dark:text-white outline-none px-4"
          required
        />
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="w-10 h-10 cursor-pointer rounded-lg" 
        />
        <button 
          type="submit" 
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-bold dark:text-white capitalize">{cat.name}</span>
              </div>

              {confirmDeleteId === cat._id ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleConfirmDelete(cat._id)} 
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Confirm delete"
                  >
                    <Check size={14}/>
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(null)} 
                    className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    title="Cancel"
                  >
                    <X size={14}/>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDeleteId(cat._id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                  title="Delete category"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categories.length === 0 && (
        <div className="text-center p-10 text-slate-400">
          <Tag size={48} className="mx-auto mb-4 opacity-50" />
          <p>No categories yet. Create your first one above!</p>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
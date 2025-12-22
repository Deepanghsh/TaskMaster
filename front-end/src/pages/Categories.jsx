import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import CategoryList from '../components/CategoryList';

const Categories = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto"
    >
      <header className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <Tag size={12} />
          <span>Organization</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white">
          Manage <span className="text-indigo-600">Categories</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Define your labels and organize your workflow with custom colors.
        </p>
      </header>

      <CategoryList />
    </motion.div>
  );
};

export default Categories;
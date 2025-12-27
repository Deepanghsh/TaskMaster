import React, { useState, useEffect } from "react";
import { Plus, Calendar, Flag, Tag } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

import { useTodos } from "../hooks/useTodos";
import { useCategories } from "../hooks/useCategories";

const priorityOptions = [
  { value: "Low", label: "Low", color: "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  { value: "Medium", label: "Medium", color: "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "High", label: "High", color: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
];

export default function TodoForm({ defaultPriority = "Low" }) {
  const { addTodo } = useTodos();
  const { categories, loading } = useCategories();

  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(defaultPriority);
  const [category, setCategory] = useState(""); 
  const [errors, setErrors] = useState({});

  // Automatically set default category once categories are loaded from API
  useEffect(() => {
    if (categories && categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const validate = () => {
    const newErrors = {};
    const today = moment().startOf("day");
    if (!text.trim()) newErrors.text = "Task name is required.";
    if (!dueDate) {
      newErrors.dueDate = "Due date is required.";
    } else if (moment(dueDate).isBefore(today)) {
      newErrors.dueDate = "Date must be today or later."; // ✅ CHANGE 1: Better error message
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Ensure we send the selected category or fallback
    const selectedCategory = category || (categories.length > 0 ? categories[0].name : "general");
    
    addTodo(text, selectedCategory, dueDate, priority, description);
    
    // Reset Form
    setText(""); 
    setDescription(""); 
    setDueDate("");
    setPriority(defaultPriority); 
    // Reset category to the first one available in the fresh list
    setCategory(categories[0]?.name || "general"); 
    setErrors({});
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Add a task..." 
        className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
      />
      {errors.text && <p className="text-red-500 text-xs pl-1">{errors.text}</p>}

      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        placeholder="Optional description" 
        rows={2} 
        className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
      />

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="date" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)} 
          className="w-full pl-10 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
        />
        {/* ✅ CHANGE 2: Removed min attribute so custom error shows */}
        {errors.dueDate && <p className="text-red-500 text-xs mt-1 pl-1">{errors.dueDate}</p>}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider ml-1">
                <Tag size={12} /> Category
            </label>
            <div className="flex flex-wrap gap-2">
                {loading ? (
                  <p className="text-xs text-gray-500 animate-pulse">Loading categories...</p>
                ) : (
                  categories?.map((c) => (
                    <button
                        key={c._id}
                        type="button"
                        onClick={() => setCategory(c.name)}
                        style={{ 
                            backgroundColor: category === c.name ? `${c.color}20` : 'transparent',
                            color: category === c.name ? c.color : '#9ca3af',
                            borderColor: category === c.name ? c.color : 'transparent'
                        }}
                        className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                            category === c.name ? "shadow-md scale-105" : "bg-gray-50 dark:bg-gray-800 border-transparent"
                        }`}
                    >
                        {c.name}
                    </button>
                  ))
                )}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider ml-1">
                <Flag size={12} /> Priority
            </label>
            <div className="flex gap-2">
                {priorityOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        className={`flex-1 py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-sm ${
                            priority === opt.value
                                ? opt.color + " border-transparent ring-2 ring-indigo-500/20 scale-105"
                                : "bg-gray-50 text-gray-400 dark:bg-gray-800 border-transparent"
                        }`}
                    >
                        <Flag className="w-3.5 h-3.5" />
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-colors flex justify-center items-center gap-2 disabled:bg-indigo-400"
      >
        <Plus className="w-5 h-5" /> Add Task
      </button>
    </motion.form>
  );
}
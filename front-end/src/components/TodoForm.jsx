import React, { useState } from "react";
import { Plus, Calendar, Flag } from "lucide-react";
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
  const { categories } = useCategories();

  const fallbackCategory = categories?.[0]?.name || "general";

  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(defaultPriority);
  const [category, setCategory] = useState(fallbackCategory);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const today = moment().startOf("day");

    if (!text.trim()) newErrors.text = "Task name is required.";
    if (!dueDate) {
      newErrors.dueDate = "Due date is required.";
    } else if (moment(dueDate).isBefore(today)) {
      newErrors.dueDate = "Due date cannot be in the past.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addTodo(text, category, dueDate, priority, description);

    setText("");
    setDescription("");
    setDueDate("");
    setPriority(defaultPriority);
    setCategory(fallbackCategory);
    setErrors({});
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="space-y-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {errors.text && <p className="text-red-500 text-xs pl-1">{errors.text}</p>}
      </div>

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
          min={moment().format("YYYY-MM-DD")}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full pl-10 p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        {errors.dueDate && (
          <p className="text-red-500 text-xs mt-1 pl-1">{errors.dueDate}</p>
        )}
      </div>

      <div className="space-y-3">
        {/* Category Selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
        >
          {categories?.map((c) => (
            <option key={c.id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* IMPROVED Priority Selector */}
        <div className="flex gap-2">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={`flex-1 py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-sm ${
                priority === opt.value
                  ? opt.color + " border-transparent ring-2 ring-indigo-500/20"
                  : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-colors flex justify-center items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Task
      </button>
    </motion.form>
  );
}
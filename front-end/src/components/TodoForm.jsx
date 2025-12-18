import React, { useState } from "react";
import { Plus, Calendar, Flag } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

import { useTodos } from "../hooks/useTodos";
import { useCategories } from "../hooks/useCategories";

const priorityOptions = [
  { value: "Low", label: "Low", iconColor: "text-green-500" },
  { value: "Medium", label: "Medium", iconColor: "text-yellow-500" },
  { value: "High", label: "High", iconColor: "text-red-500" },
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
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task..."
        className="w-full p-3 rounded-xl border"
      />
      {errors.text && <p className="text-red-500 text-xs">{errors.text}</p>}

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description"
        rows={2}
        className="w-full p-3 rounded-xl border"
      />

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <input
          type="date"
          value={dueDate}
          min={moment().format("YYYY-MM-DD")}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full pl-10 p-3 rounded-xl border"
        />
      </div>
      {errors.dueDate && (
        <p className="text-red-500 text-xs">{errors.dueDate}</p>
      )}

      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 p-3 rounded-xl border"
        >
          {categories?.map((c) => (
            <option key={c.id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full pl-10 p-3 rounded-xl border"
          >
            {priorityOptions.map((p) => (
              <option key={p.value}>{p.value}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 rounded-xl flex justify-center items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Task
      </button>
    </motion.form>
  );
}

import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useTodos } from "../hooks/useTodos";
import { useTheme } from "../hooks/useTheme";

// Import Components
import ProgressBar from "../components/ProgressBar";
import TodoForm from "../components/TodoForm";
import FilterBar from "../components/FilterBar";
import TodoItem from "../components/TodoItem";
import AnalyticsChart from "../components/AnalyticsChart";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper Component: TodoList (Stays in Home.jsx) ---
const TodoList = ({ filter, search, categoryFilter }) => {
  const { todos } = useTodos();
  const activeTodos = todos.filter(t => !t.archived);

  const filteredTodos = activeTodos
    .filter(todo => {
      const matchesSearch = (todo.text || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || todo.category === categoryFilter;

      let matchesFilter = filter === "all";
      if (filter === "active") matchesFilter = !todo.completed;
      if (filter === "completed") matchesFilter = todo.completed;

      return matchesSearch && matchesCategory && matchesFilter;
    })
    .reverse();

  return (
    <div className="space-y-3 pt-2">
      <AnimatePresence initial={false}>
        {filteredTodos.map(todo => (
          <motion.div
            key={todo._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TodoItem todo={todo} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const { user } = useAuth();

  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hello, {user?.name || "User"} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Let's get some work done today.
          </p>
        </div>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE: Progress + Analytics */}
        <div className="lg:col-span-8 space-y-6">
          <ProgressBar />

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <AnalyticsChart />
          </div>
        </div>

        {/* RIGHT SIDE: Quick Add (MOVED UP) */}
        <div className="lg:col-span-4 lg:self-start lg:-mt-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Quick Add
            </h3>
            <TodoForm defaultPriority="Low" />
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TASKS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🎯 Your Tasks
          </h2>

          <div className="flex-1 max-w-2xl">
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/20">
          <TodoList
            filter={filter}
            search={search}
            categoryFilter={categoryFilter}
          />
        </div>
      </div>
    </div>
  );
}

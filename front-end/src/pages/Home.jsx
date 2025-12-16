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
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Component: TodoList (Lives inside Home.jsx) ---
const TodoList = ({ filter, search, categoryFilter }) => {
    const { todos } = useTodos();
    
    // Filtering Logic
    const activeTodos = todos.filter(t => !t.archived);
    
    const filteredTodos = activeTodos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
        let matchesFilter = true;
        
        if (filter === 'active') matchesFilter = !todo.completed;
        if (filter === 'completed') matchesFilter = todo.completed;
        
        return matchesSearch && matchesCategory && matchesFilter;
    });

    return (
        <div className="space-y-4 pt-4">
            <AnimatePresence>
                {filteredTodos.map(todo => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </AnimatePresence>
            {filteredTodos.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700"
                >
                    <p className="font-medium text-lg">No tasks found.</p>
                    <p className="text-sm">Try adjusting your filters or add a new task above!</p>
                </motion.div>
            )}
        </div>
    );
};
// --- End Helper Component ---


export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme(); // Included for completeness, though not used in UI yet
  
  // States for filtering tasks
  const [filter, setFilter] = React.useState('all'); // all, active, completed
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('general');

  return (
    <div className="w-full mx-auto space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          Hello, {user?.name || "User"} 👋
        </h1>
      </div>

      {/* Grid Layout for Stats and Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Bar (Col 1-2) */}
        <div className="lg:col-span-3 xl:col-span-2">
          <ProgressBar />
        </div>
        
        {/* Quick Action (Col 3) - Uses TodoForm for quick addition */}
        <div className="lg:col-span-3 xl:col-span-1 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full hidden lg:block">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Quick Add</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Add a new task directly to your list.</p>
            <TodoForm />
        </div>
      </div>

      {/* Main Task Management Section */}
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b pb-3 mb-4">
              🎯 Your Tasks
          </h2>

          {/* Filter and Search Bar */}
          <FilterBar 
              filter={filter} 
              setFilter={setFilter} 
              search={search} 
              setSearch={setSearch} 
              categoryFilter={categoryFilter} 
              setCategoryFilter={setCategoryFilter}
          />
          
          {/* Todo List */}
          <TodoList 
              filter={filter} 
              search={search} 
              categoryFilter={categoryFilter} 
          />
      </div>

      {/* Analytics (Mobile/Tablet View) */}
      <div className="lg:hidden"> 
        <AnalyticsChart />
      </div>

    </div>
  );
}
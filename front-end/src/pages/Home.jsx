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
import UpcomingEvents from "../pages/Upcoming";
import ThemeToggle from "../components/ThemeToggle"; 
import { motion, AnimatePresence } from 'framer-motion';


// --- Helper Component: TodoList (Stays in Home.jsx) ---
const TodoList = ({ filter, search, categoryFilter }) => {
    const { todos } = useTodos();
    
    const activeTodos = todos.filter(t => !t.archived);
    
    const filteredTodos = activeTodos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
        let matchesFilter = filter === 'all';
        
        if (filter === 'active') matchesFilter = !todo.completed;
        if (filter === 'completed') matchesFilter = todo.completed;
        
        return matchesSearch && matchesCategory && matchesFilter;
    });

    return (
        <div className="space-y-4 pt-4 min-h-[150px]">
            <AnimatePresence initial={false}> 
                {filteredTodos.map(todo => (
                    <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* isReadOnly={false} ensures deletion/editing are available in the main list */}
                        <TodoItem todo={todo} isReadOnly={false} /> 
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {filteredTodos.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700"
                >
                    <p className="font-medium text-lg">No tasks found. Try adjusting filters.</p>
                </motion.div>
            )}
        </div>
    );
};
// --- End Helper Component ---


export default function Home() {
  const { user } = useAuth();
  const { todos } = useTodos(); 
  const { theme } = useTheme(); 
  
  const [filter, setFilter] = React.useState('all'); 
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('general');

  return (
    <div className="w-full mx-auto space-y-8 p-4 sm:p-0">
      
      {/* Dashboard Header (Hello message and Theme Toggle) */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          Hello, {user?.name || "User"} 👋
        </h1>
        <ThemeToggle /> 
      </div>

      {/* Grid Layout for Progress and Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <ProgressBar /> 
        </div>
        
        <div className="lg:col-span-1 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Quick Add</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                Add a new task directly to your list.
            </p>
            <TodoForm defaultPriority="low" /> 
        </div>
      </div>
      
      {/* 🛑 REMOVED: The section that rendered <UpcomingEvents /> is deleted */}
      {/*       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
              <UpcomingEvents /> 
          </div>
      </div>
      */}

      {/* Your Tasks Section */}
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center">
              🎯 Your Tasks
          </h2>

          <FilterBar 
              filter={filter} 
              setFilter={setFilter} 
              search={search} 
              setSearch={setSearch} 
              categoryFilter={categoryFilter} 
              setCategoryFilter={setCategoryFilter}
          />
          
          <TodoList 
              filter={filter} 
              search={search} 
              categoryFilter={categoryFilter} 
          />
      </div>

      <div className="p-6 lg:p-0"> 
        <AnalyticsChart />
      </div>

    </div>
  );
}
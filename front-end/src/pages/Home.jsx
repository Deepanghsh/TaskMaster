import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useTodos } from "../hooks/useTodos";
import { useTheme } from "../hooks/useTheme";
import { isTaskOverdue, getDaysOverdue } from "../utils/notificationUtils";
import moment from "moment";

// Import Components
import ProgressBar from "../components/ProgressBar";
import TodoForm from "../components/TodoForm";
import FilterBar from "../components/FilterBar";
import TodoItem from "../components/TodoItem";
import AnalyticsChart from "../components/AnalyticsChart";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Calendar } from "lucide-react";

// --- Helper Component: TodoList with 2-Column Grid Layout ---
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
    .sort((a, b) => {
      // Sort: Overdue tasks first, then by due date, then by priority
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });

  // Group tasks by date
  const groupedTasks = filteredTodos.reduce((groups, todo) => {
    let dateKey;
    
    if (isTaskOverdue(todo)) {
      dateKey = 'Overdue';
    } else if (todo.dueDate) {
      const dueDate = moment(todo.dueDate);
      const today = moment().startOf('day');
      const tomorrow = moment().add(1, 'day').startOf('day');
      
      if (dueDate.isSame(today, 'day')) {
        dateKey = 'Today';
      } else if (dueDate.isSame(tomorrow, 'day')) {
        dateKey = 'Tomorrow';
      } else if (dueDate.isBefore(moment().add(7, 'days'))) {
        dateKey = dueDate.format('dddd, MMM D');
      } else {
        dateKey = dueDate.format('MMM D, YYYY');
      }
    } else {
      dateKey = 'No Due Date';
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(todo);
    
    return groups;
  }, {});

  const overdueCount = filteredTodos.filter(t => isTaskOverdue(t)).length;

  // Order of date groups
  const dateOrder = ['Overdue', 'Today', 'Tomorrow'];
  const sortedDateGroups = Object.keys(groupedTasks).sort((a, b) => {
    const aIndex = dateOrder.indexOf(a);
    const bIndex = dateOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return new Date(a) - new Date(b);
  });

  return (
    <div className="space-y-8 pt-2">
      {/* Overdue Warning Banner */}
      {overdueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-900 dark:text-red-300">
              {overdueCount} {overdueCount === 1 ? 'task is' : 'tasks are'} overdue
            </p>
            <p className="text-xs text-red-700 dark:text-red-400">
              Complete or reschedule them to stay on track
            </p>
          </div>
        </motion.div>
      )}

      {/* Date-grouped tasks - 2 COLUMN GRID */}
      <AnimatePresence initial={false}>
        {sortedDateGroups.map(dateKey => (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                dateKey === 'Overdue' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : dateKey === 'Today'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : dateKey === 'Tomorrow'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>{dateKey}</span>
                <span className="text-xs opacity-75">({groupedTasks[dateKey].length})</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Tasks Grid - 2 COLUMNS with generous spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTasks[dateKey].map(todo => {
                const overdue = isTaskOverdue(todo);
                const daysOverdue = overdue ? getDaysOverdue(todo) : 0;

                return (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative h-full"
                  >
                    {/* Overdue Badge */}
                    {overdue && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                          <span>🔴</span>
                          <span>{daysOverdue}d overdue</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Todo Item with red border if overdue */}
                    <div className={`h-full ${overdue ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900 rounded-xl' : ''}`}>
                      <TodoItem todo={todo} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredTodos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No tasks found. Add one to get started! 🚀
          </p>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { user } = useAuth();
  const { todos } = useTodos();

  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Count overdue tasks
  const overdueCount = todos.filter(t => isTaskOverdue(t) && !t.archived).length;

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

        {/* Overdue Counter Badge */}
        {overdueCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <p className="text-xs font-bold">
              {overdueCount} Overdue
            </p>
          </motion.div>
        )}
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

        {/* RIGHT SIDE: Quick Add */}
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
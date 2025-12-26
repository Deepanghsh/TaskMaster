import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useTodos } from "../hooks/useTodos";
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
const TodoList = ({ filter, search, categoryFilter, dueDateFilter }) => {
  const { todos } = useTodos();

  // Filter based on completion status
  let activeTodos;
  if (filter === "completed") {
    // Show completed tasks when "Completed" filter is active
    activeTodos = todos.filter(t => t.completed && !t.archived);
  } else {
    // Show only active (not completed, not archived) tasks for "All" and "Active"
    activeTodos = todos.filter(t => !t.archived && !t.completed);
  }

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

      // Due date filter
      let matchesDueDate = true;
      if (dueDateFilter !== "all") {
        const today = moment().startOf('day');
        const tomorrow = moment().add(1, 'day').startOf('day');
        const weekEnd = moment().endOf('week');
        const monthEnd = moment().endOf('month');

        switch (dueDateFilter) {
          case "overdue":
            matchesDueDate = isTaskOverdue(todo);
            break;
          case "today":
            matchesDueDate = todo.dueDate && moment(todo.dueDate).isSame(today, 'day');
            break;
          case "tomorrow":
            matchesDueDate = todo.dueDate && moment(todo.dueDate).isSame(tomorrow, 'day');
            break;
          case "week":
            matchesDueDate = todo.dueDate && moment(todo.dueDate).isBetween(today, weekEnd, null, '[]');
            break;
          case "month":
            matchesDueDate = todo.dueDate && moment(todo.dueDate).isBetween(today, monthEnd, null, '[]');
            break;
          case "no-date":
            matchesDueDate = !todo.dueDate;
            break;
          default:
            matchesDueDate = true;
        }
      }

      return matchesSearch && matchesCategory && matchesFilter && matchesDueDate;
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
      {/* Overdue Warning Banner - Only show for active tasks */}
      {overdueCount > 0 && filter !== "completed" && (
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
                    {/* Overdue Badge - Only show for active tasks */}
                    {overdue && filter !== "completed" && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                          <span>🔴</span>
                          <span>{daysOverdue}d overdue</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Todo Item with red border if overdue and not completed */}
                    <div className={`h-full ${overdue && filter !== "completed" ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900 rounded-xl' : ''}`}>
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
            {filter === "completed" 
              ? "No completed tasks yet. Complete some tasks to see them here! 🎉" 
              : "No tasks found. Add one to get started! 🚀"
            }
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
  const [dueDateFilter, setDueDateFilter] = React.useState("all");

  // Count overdue tasks (excluding completed)
  const overdueCount = todos.filter(t => isTaskOverdue(t) && !t.archived && !t.completed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hello, {user?.name || "User"} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
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

      {/* TOP SECTION - Fixed Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE: Progress + Analytics (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressBar />

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <AnalyticsChart />
          </div>
        </div>

        {/* RIGHT SIDE: Quick Add (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 sticky top-4">
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
              dueDateFilter={dueDateFilter}
              setDueDateFilter={setDueDateFilter}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/20">
          <TodoList
            filter={filter}
            search={search}
            categoryFilter={categoryFilter}
            dueDateFilter={dueDateFilter}
          />
        </div>
      </div>
    </div>
  );
}
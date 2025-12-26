import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "./NotificationContext";
import { 
  isTaskOverdue, 
  isTaskDueToday, 
  isTaskDueSoon,
  getTaskNotificationMessage 
} from "../utils/notificationUtils";

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addNotification, settings } = useNotifications();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error fetching tasks:", err);
      }
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      setLoading(true);
      fetchTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [user, token, fetchTodos]);

  // Smart notification logic based on priority
  const shouldNotify = (task, notificationType) => {
    if (!settings.enabled) return false;

    const priority = task.priority || 'Low';

    // Low Priority: No notifications at all (in-app only, shown in UI but not notified)
    if (priority === 'Low') {
      return false;
    }

    // Medium Priority: Silent notifications (only if user enabled browser notifications)
    if (priority === 'Medium') {
      // Only show browser notification if explicitly enabled AND browser notifications are on
      return settings.browserNotifications && settings.soundEnabled === false;
    }

    // High Priority: Always notify (even in silent mode)
    if (priority === 'High') {
      return true;
    }

    return false;
  };

  // Check for "due tomorrow" tasks when todos load or change
  useEffect(() => {
    console.log('🔍 Checking for due tomorrow tasks...');
    console.log('Settings enabled:', settings.enabled);
    console.log('One day before enabled:', settings.oneDayBefore);
    console.log('Todos count:', todos.length);

    if (!settings.enabled) {
      console.log('❌ Notifications are disabled in settings');
      return;
    }
    
    if (!settings.oneDayBefore) {
      console.log('❌ One day before reminder is disabled');
      return;
    }
    
    if (todos.length === 0) {
      console.log('❌ No todos to check');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('📅 Tomorrow date:', tomorrow.toDateString());
    
    const dueTomorrow = todos.filter(task => {
      if (task.completed || task.archived || !task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      console.log(`Task "${task.text}": Due date = ${taskDate.toDateString()}, Tomorrow = ${tomorrow.toDateString()}`);
      return taskDate.toDateString() === tomorrow.toDateString();
    });

    console.log('✅ Tasks due tomorrow:', dueTomorrow.length);

    // Create notifications for tasks due tomorrow
    if (dueTomorrow.length > 0) {
      dueTomorrow.forEach(task => {
        console.log('📆 Creating notification for:', task.text);
        addNotification({
          type: 'due_tomorrow',
          title: '📆 Task Due Tomorrow',
          message: `"${task.text}" is due tomorrow`,
          priority: task.priority,
          taskId: task._id
        });
      });
    } else {
      console.log('❌ No tasks due tomorrow');
    }
  }, [todos, settings.enabled, settings.oneDayBefore, addNotification]);

  // Check for task notifications every minute
  useEffect(() => {
    if (!settings.enabled || todos.length === 0) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check for tasks due soon (1 hour before) - Only Medium and High
      if (settings.oneHourBefore) {
        todos.forEach(task => {
          if (isTaskDueSoon(task) && !task.notifiedDueSoon) {
            // Only notify Medium and High priority tasks
            if (task.priority === 'Medium' || task.priority === 'High') {
              if (shouldNotify(task, 'due_soon')) {
                addNotification({
                  type: 'due_soon',
                  title: '⏰ Task Due Soon!',
                  message: getTaskNotificationMessage(task, 'due_soon'),
                  priority: task.priority,
                  taskId: task._id
                });
                task.notifiedDueSoon = true;
              }
            }
          }
        });
      }

      // Check for tasks due today (at scheduled time)
      const [dueTodayHour, dueTodayMinute] = settings.dueTodayTime.split(':').map(Number);
      if (currentHour === dueTodayHour && currentMinute === dueTodayMinute) {
        const dueToday = todos.filter(task => isTaskDueToday(task));
        const highPriorityToday = dueToday.filter(t => t.priority === 'High');
        const mediumPriorityToday = dueToday.filter(t => t.priority === 'Medium');

        // Always notify for High priority
        if (highPriorityToday.length > 0) {
          addNotification({
            type: 'due_today',
            title: '📅 High Priority Tasks Due Today',
            message: `You have ${highPriorityToday.length} high priority task${highPriorityToday.length > 1 ? 's' : ''} due today`,
            priority: 'High'
          });
        }

        // Notify for Medium priority only if browser notifications enabled
        if (mediumPriorityToday.length > 0 && settings.browserNotifications) {
          addNotification({
            type: 'due_today',
            title: '📅 Tasks Due Today',
            message: `You have ${mediumPriorityToday.length} task${mediumPriorityToday.length > 1 ? 's' : ''} due today`,
            priority: 'Medium'
          });
        }
      }

      // Check for overdue tasks (at scheduled time) - Only High priority
      if (settings.overdueDaily) {
        const [overdueHour, overdueMinute] = settings.overdueTime.split(':').map(Number);
        if (currentHour === overdueHour && currentMinute === overdueMinute) {
          const overdueHigh = todos.filter(task => isTaskOverdue(task) && task.priority === 'High');
          if (overdueHigh.length > 0) {
            addNotification({
              type: 'overdue',
              title: '🔴 High Priority Tasks Overdue',
              message: `You have ${overdueHigh.length} high priority overdue task${overdueHigh.length > 1 ? 's' : ''}`,
              priority: 'High'
            });
          }
        }
      }
    };

    // Check immediately
    checkNotifications();

    // Then check every minute
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [todos, settings, addNotification]);

  const addTodo = async (text, category = "general", dueDate = "", priority = "Medium", description = "") => {
    if (!text.trim()) return;
    try {
      const res = await api.post("/todos", { text, category, dueDate, priority, description });
      setTodos((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTodo = async (id, newText) => {
    try {
      const res = await api.put(`/todos/${id}`, { text: newText });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const updateTodoField = async (id, field, value) => {
    try {
      const res = await api.put(`/todos/${id}`, { [field]: value });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating field:", err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    try {
      const isCompleting = !todo.completed;
      const res = await api.put(`/todos/${id}`, {
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));

      // Show completion notification only for High priority tasks
      if (isCompleting && settings.enabled && todo.priority === 'High') {
        addNotification({
          type: 'completed',
          title: '✅ High Priority Task Completed!',
          message: getTaskNotificationMessage(todo, 'completed'),
          priority: todo.priority,
          taskId: id
        });
      }
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const archiveTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, {
        archived: true,
        completed: true,
        completedAt: new Date().toISOString() 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error archiving todo:", err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      const res = await api.put(`/todos/${id}`, {
        archived: false,
        completed: false,
        completedAt: null 
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error restoring todo:", err);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        fetchTodos,
        addTodo,
        updateTodo,
        updateTodoField,
        toggleTodo,
        deleteTodo,
        archiveTodo,
        restoreTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within TodoProvider");
  return context;
};
import moment from 'moment';

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task) => {
  if (!task.dueDate || task.completed) return false;
  return moment(task.dueDate).isBefore(moment(), 'day');
};

/**
 * Check if a task is due today
 */
export const isTaskDueToday = (task) => {
  if (!task.dueDate || task.completed) return false;
  return moment(task.dueDate).isSame(moment(), 'day');
};

/**
 * Check if a task is due tomorrow (1 day before)
 */
export const isTaskDueTomorrow = (task) => {
  if (!task.dueDate || task.completed) return false;
  const tomorrow = moment().add(1, 'day');
  return moment(task.dueDate).isSame(tomorrow, 'day');
};

/**
 * Check if a task is due within the next hour
 */
export const isTaskDueSoon = (task) => {
  if (!task.dueDate || task.completed) return false;
  const dueTime = moment(task.dueDate);
  const now = moment();
  const diffMinutes = dueTime.diff(now, 'minutes');
  return diffMinutes > 0 && diffMinutes <= 60;
};

/**
 * Get number of days overdue
 */
export const getDaysOverdue = (task) => {
  if (!isTaskOverdue(task)) return 0;
  return moment().diff(moment(task.dueDate), 'days');
};

/**
 * Get all overdue tasks
 */
export const getOverdueTasks = (todos) => {
  return todos.filter(task => isTaskOverdue(task));
};

/**
 * Get all tasks due today
 */
export const getTasksDueToday = (todos) => {
  return todos.filter(task => isTaskDueToday(task));
};

/**
 * Get all tasks due tomorrow
 */
export const getTasksDueTomorrow = (todos) => {
  return todos.filter(task => isTaskDueTomorrow(task));
};

/**
 * Get all tasks due soon (within 1 hour)
 */
export const getTasksDueSoon = (todos) => {
  return todos.filter(task => isTaskDueSoon(task));
};

/**
 * Format overdue text
 */
export const formatOverdueText = (task) => {
  const days = getDaysOverdue(task);
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day overdue';
  return `${days} days overdue`;
};

/**
 * Get task notification message
 */
export const getTaskNotificationMessage = (task, type) => {
  switch (type) {
    case 'due_today':
      return `"${task.text}" is due today`;
    case 'due_tomorrow':
      return `"${task.text}" is due tomorrow`;
    case 'due_soon':
      return `"${task.text}" is due in less than 1 hour!`;
    case 'overdue':
      return `"${task.text}" is ${formatOverdueText(task)}`;
    case 'completed':
      return `Great job! You completed "${task.text}"`;
    default:
      return `Task: "${task.text}"`;
  }
};

/**
 * Check if it's time to send scheduled notifications
 */
export const shouldSendScheduledNotification = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = moment();
  return now.hours() === hours && now.minutes() === minutes;
};

/**
 * Group tasks by priority
 */
export const groupTasksByPriority = (tasks) => {
  return {
    high: tasks.filter(t => t.priority === 'High'),
    medium: tasks.filter(t => t.priority === 'Medium'),
    low: tasks.filter(t => t.priority === 'Low')
  };
};
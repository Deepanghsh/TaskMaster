import Notification from '../models/Notification.js';
import Todo from '../models/Todo.js';
import moment from 'moment';

// Generate notifications for all users
export const generateNotifications = async () => {
  try {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    // Get all active (non-completed, non-archived) tasks
    const todos = await Todo.find({ 
      completed: false, 
      archived: false 
    });

    for (const todo of todos) {
      const dueDate = moment(todo.dueDate);

      // Overdue notification
      if (dueDate.isBefore(today)) {
        await createNotificationIfNotExists({
          user: todo.user,
          type: 'overdue',
          taskId: todo._id,
          message: `Task "${todo.text}" is overdue!`
        });
      }
      // Due today notification
      else if (dueDate.isSame(today, 'day')) {
        await createNotificationIfNotExists({
          user: todo.user,
          type: 'dueToday',
          taskId: todo._id,
          message: `Task "${todo.text}" is due today!`
        });
      }
      // Due tomorrow notification
      else if (dueDate.isSame(tomorrow, 'day')) {
        await createNotificationIfNotExists({
          user: todo.user,
          type: 'dueTomorrow',
          taskId: todo._id,
          message: `Task "${todo.text}" is due tomorrow!`
        });
      }
    }

    console.log('Notifications generated successfully');
  } catch (err) {
    console.error('Error generating notifications:', err.message);
  }
};

// Helper: Create notification if it doesn't already exist
const createNotificationIfNotExists = async (notificationData) => {
  const existing = await Notification.findOne({
    user: notificationData.user,
    taskId: notificationData.taskId,
    type: notificationData.type,
    isRead: false
  });

  // Don't create duplicate unread notifications
  if (!existing) {
    await Notification.create(notificationData);
  }
};
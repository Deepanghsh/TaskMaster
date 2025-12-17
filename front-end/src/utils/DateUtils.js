import moment from 'moment';

export const getDueDateAlert = (dueDate, isCompleted = false) => {
    if (isCompleted || !dueDate) {
        return { text: 'N/A', color: 'text-gray-400', icon: '', order: 4 };
    }

    const date = moment(dueDate, "YYYY-MM-DD");
    const today = moment().startOf('day');
    const diffDays = date.diff(today, 'days');

    if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        return { 
            text: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`, 
            color: 'text-red-600 dark:text-red-500', 
            icon: '⚠️', 
            order: 1 
        };
    } else if (diffDays === 0) {
        return { 
            text: 'Due Today', 
            color: 'text-red-500 dark:text-red-400 font-bold', 
            icon: '🔥', 
            order: 2
        };
    } else if (diffDays === 1) {
        return { 
            text: 'Due Tomorrow', 
            color: 'text-amber-500 dark:text-yellow-400', 
            icon: '🟡',
            order: 3
        };
    } else if (diffDays > 1 && diffDays <= 7) {
        return { 
            text: `Due in ${diffDays} days`, 
            color: 'text-yellow-600 dark:text-yellow-500', 
            icon: '⏳',
            order: 3 
        };
    } else {
        return { 
            text: date.format('MMM D, YYYY'), 
            color: 'text-green-600 dark:text-green-500', 
            icon: '✅',
            order: 4
        };
    }
};
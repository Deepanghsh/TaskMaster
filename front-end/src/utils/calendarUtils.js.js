import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';

/**
 * @param {Date} currentDate 
 * @returns {Array<Object>} 
 */
export const getCalendarDays = (currentDate) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
        // Loop through 7 days
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, 'yyyy-MM-dd');
            rows.push({
                dateObject: day,
                dateString: formattedDate,
                isCurrentMonth: isSameMonth(day, monthStart),
                isToday: isSameDay(day, new Date()),
            });
            day = addDays(day, 1);
        }
    }

    return rows;
};

export const getDayNames = () => {
    const baseDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => format(addDays(baseDate, i), 'eee'));
};
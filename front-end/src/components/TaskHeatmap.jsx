import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import moment from 'moment';

const TaskHeatmap = ({ todos }) => {
  // Logic: Count all completed tasks (including archived) for history
  const completedTasks = todos.filter(t => t.completed === true);

  const dataMap = completedTasks.reduce((acc, todo) => {
    // Priority: completedAt > updatedAt > dueDate
    const rawDate = todo.completedAt || todo.updatedAt || todo.dueDate;
    const date = moment(rawDate).format('YYYY-MM-DD');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const values = Object.keys(dataMap).map(date => ({
    date,
    count: dataMap[date],
  }));

  const today = new Date();
  const lastYear = moment().subtract(1, 'year').toDate();
  const totalCompletedLastYear = values.reduce((a, b) => a + b.count, 0);

  return (
    <div className="p-8 bg-white dark:bg-[#0d1117] rounded-3xl shadow-sm border border-gray-100 dark:border-[#30363d] transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-[#f0f6fc]">Task Activity</h3>
          <p className="text-sm text-gray-500 dark:text-[#8b949e] font-medium">
            {totalCompletedLastYear} tasks completed in the last year
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-[#8b949e]">
          <span>Less tasks</span>
          <div className="flex gap-[3px]">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#40c463] dark:bg-[#006d32]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#30a14e] dark:bg-[#26a641]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#216e39] dark:bg-[#39d353]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="heatmap-wrapper">
        <CalendarHeatmap
          startDate={lastYear}
          endDate={today}
          values={values}
          gutterSize={3}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count === 1) return 'color-scale-1';
            if (value.count === 2) return 'color-scale-2';
            if (value.count === 3) return 'color-scale-3';
            return 'color-scale-4';
          }}
          tooltipDataAttrs={(value) => ({
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-content': value.date 
              ? `${value.count} ${value.count === 1 ? 'task' : 'tasks'} completed on ${moment(value.date).format('MMM D, YYYY')}`
              : 'No tasks completed',
          })}
        />
        <Tooltip id="heatmap-tooltip" className="!rounded-lg !text-[11px] !bg-[#24292f] dark:!bg-[#6e7681]" />
      </div>

      <style>{`
        .react-calendar-heatmap .color-empty { fill: #ebedf0; }
        .react-calendar-heatmap .color-scale-1 { fill: #9be9a8; }
        .react-calendar-heatmap .color-scale-2 { fill: #40c463; }
        .react-calendar-heatmap .color-scale-3 { fill: #30a14e; }
        .react-calendar-heatmap .color-scale-4 { fill: #216e39; }

        .dark .react-calendar-heatmap .color-empty { fill: #161b22; }
        .dark .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
        .dark .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
        .dark .react-calendar-heatmap .color-scale-3 { fill: #26a641; }
        .dark .react-calendar-heatmap .color-scale-4 { fill: #39d353; }

        .react-calendar-heatmap rect {
          rx: 2px;
          ry: 2px;
          transition: all 0.2s ease;
        }

        .react-calendar-heatmap rect:hover {
          stroke: #6366f1;
          stroke-width: 1px;
        }
      `}</style>
    </div>
  );
};

export default TaskHeatmap;
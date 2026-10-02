import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  Circle,
  AlertCircle,
  CloudUpload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Subtask, TaskPriority } from '../types/task';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, partial: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);
  const isCompleted = task.status === 'completed';

  const handleToggleCompleted = () => {
    const nextStatus = isCompleted ? 'todo' : 'completed';
    if (nextStatus === 'completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Safe fallback if confetti canvas fails
      }
    }
    onUpdate(task.id, { status: nextStatus });
  };

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
    onUpdate(task.id, {
      subtasks: updatedSubtasks,
      status: allCompleted ? 'completed' : task.status === 'completed' ? 'in_progress' : task.status,
    });
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getDueDateStatus = (dueDateStr: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, isLate: true };
    } else if (diffDays === 0) {
      return { label: 'Due Today', isToday: true };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', isSoon: true };
    } else {
      return { label: `Due in ${diffDays}d`, isNormal: true };
    }
  };

  const dueStatus = getDueDateStatus(task.dueDate);
  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const subtaskProgress = subtasksTotal > 0 ? (completedSubtasksCount / subtasksTotal) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-lg group hover:border-slate-600 ${
        isCompleted
          ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox & Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggleCompleted}
            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'border-slate-600 hover:border-blue-400 bg-slate-800/60 text-transparent hover:text-slate-400'
            }`}
            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-semibold text-sm sm:text-base leading-snug break-words ${
                  isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                }`}
              >
                {task.title}
              </h4>

              {/* Offline pending badge */}
              {task._pendingSync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
                  <CloudUpload className="w-3 h-3" /> Queued Offline
                </span>
              )}
            </div>

            {Boolean(task.description) && (
              <p
                className={`text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2 ${
                  isCompleted ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks Progress Bar & Toggle */}
      {subtasksTotal > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <button
              onClick={() => setExpandedSubtasks(!expandedSubtasks)}
              className="flex items-center gap-1.5 font-medium hover:text-slate-200 transition-colors"
            >
              <span>
                {completedSubtasksCount} of {subtasksTotal} subtasks completed ({Math.round(subtaskProgress)}%)
              </span>
              {expandedSubtasks ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>

          {/* Subtasks Expanded List */}
          {expandedSubtasks && (
            <div className="mt-2.5 space-y-1.5 pl-2">
              {task.subtasks.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleToggleSubtask(sub.id)}
                  className="flex items-center gap-2 text-xs w-full text-left py-1 hover:text-slate-200 transition-colors group/sub"
                >
                  {sub.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-500 group-hover/sub:text-slate-300 shrink-0" />
                  )}
                  <span
                    className={
                      sub.completed ? 'line-through text-slate-500' : 'text-slate-300'
                    }
                  >
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meta Pills (Priority, Category, Due Date, Tags) */}
      <div className="mt-3.5 flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority.toUpperCase()}
          </span>

          {/* Category */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {task.category}
          </span>

          {/* Due Date */}
          {dueStatus && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                dueStatus.isLate
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold'
                  : dueStatus.isToday
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {dueStatus.label}
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5 text-cyan-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/appStore";
import type { Task } from "@/types/task.ts";

type TaskProps = {
  task: Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setDisplayEditTask: (value: boolean) => void;
  setEditTaskId: (id: string) => void;
};

const getDueDate = (task: Task): Date | null => {
  if (!task.date) return null
  const dueDate = new Date(`${task.date}T${task.time || '23:59'}`)
  return Number.isNaN(dueDate.getTime()) ? null : dueDate
}

const getDueLabel = (task: Task): { label: string; overdue: boolean } | null => {
  const dueDate = getDueDate(task)
  if (!dueDate) return null

  const today = new Date()
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const dateLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(dueDate)
  const timeLabel = task.time
    ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(dueDate)
    : null

  if (!task.completed && task.status !== 'Cancelled' && dueDate < today && dueDate < endOfToday) {
    return { label: `Overdue · ${dateLabel}${timeLabel ? `, ${timeLabel}` : ''}`, overdue: true }
  }
  if (dueDate.getFullYear() === today.getFullYear()
    && dueDate.getMonth() === today.getMonth()
    && dueDate.getDate() === today.getDate()) {
    return { label: `Today${timeLabel ? ` · ${timeLabel}` : ''}`, overdue: false }
  }
  if (dueDate.getFullYear() === tomorrow.getFullYear()
    && dueDate.getMonth() === tomorrow.getMonth()
    && dueDate.getDate() === tomorrow.getDate()) {
    return { label: `Tomorrow${timeLabel ? ` · ${timeLabel}` : ''}`, overdue: false }
  }
  return { label: `${dateLabel}${timeLabel ? ` · ${timeLabel}` : ''}`, overdue: false }
}

const statusClass: Record<string, string> = {
  'Pending': 'bg-slate-500/10 text-slate-400',
  'In Progress': 'bg-sky-500/10 text-sky-300',
  'Done': 'bg-emerald-500/10 text-emerald-300',
  'Cancelled': 'bg-slate-500/10 text-slate-500',
}

const priorityClass: Record<string, string> = {
  'Low': 'text-slate-400',
  'Medium': 'text-amber-300',
  'High': 'text-rose-300',
}

const TaskItem = ({ task, toggleTask, deleteTask, setDisplayEditTask, setEditTaskId }: TaskProps) => {
  const [expanded, setExpanded] = useState(false)
  const isDark = useAppStore((state) => state.isDark)
  const dueDate = getDueDate(task)
  const due = getDueLabel(task)
  const taskId = task._id
  const cancelled = task.status === 'Cancelled'

  const edit = () => {
    if (!taskId) return
    setEditTaskId(taskId)
    setDisplayEditTask(true)
  }

  return (
    <li className={`group rounded-xl border p-3 transition-colors sm:p-4 ${
      isDark
        ? task.completed
          ? 'border-white/5 bg-white/[0.02] opacity-75'
          : due?.overdue
            ? 'border-rose-400/20 bg-rose-500/[0.035]'
            : 'border-white/10 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.05]'
        : task.completed
          ? 'border-slate-200 bg-slate-50 opacity-75'
          : due?.overdue
            ? 'border-rose-200 bg-rose-50'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`}>
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`${task.completed ? 'Reopen' : 'Complete'} task: ${task.title ?? 'Untitled task'}`}
          disabled={cancelled || !taskId}
          checked={Boolean(task.completed)}
          onCheckedChange={() => taskId && toggleTask(taskId)}
          className="mt-1 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className={`break-words text-sm font-medium ${task.completed
                ? (isDark ? 'text-white/60' : 'text-slate-500')
                : (isDark ? 'text-white' : 'text-slate-900')} ${task.completed ? 'line-through' : ''}`}>
                {task.title || 'Untitled task'}
              </p>
              {task.description && (
                <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{task.description}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-1 ${isDark
                ? (statusClass[task.status ?? 'Pending'] ?? statusClass.Pending)
                : task.status === 'Done'
                  ? 'bg-emerald-50 text-emerald-700'
                  : task.status === 'In Progress'
                    ? 'bg-sky-50 text-sky-700'
                    : task.status === 'Cancelled'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-slate-100 text-slate-600'}`}>
                {task.status ?? 'Pending'}
              </span>
              <span className={`font-medium ${isDark
                ? (priorityClass[task.priority ?? 'Medium'] ?? priorityClass.Medium)
                : task.priority === 'High'
                  ? 'text-rose-700'
                  : task.priority === 'Low'
                    ? 'text-slate-500'
                    : 'text-amber-700'}`}>
                {task.priority ?? 'Medium'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {due && (
              <span className={`inline-flex items-center gap-1.5 text-xs ${due.overdue
                ? (isDark ? 'text-rose-300' : 'text-rose-700')
                : (isDark ? 'text-white/50' : 'text-slate-500')}`}>
                <CalendarDays size={14} aria-hidden="true" />
                {due.label}
              </span>
            )}
            {task.taskList && (
              <span className={`rounded-full border px-2 py-0.5 text-xs ${isDark ? 'border-white/10 text-white/50' : 'border-slate-200 text-slate-500'}`}>
                {task.taskList}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={edit}
                disabled={!taskId}
                aria-label={`Edit ${task.title ?? 'task'}`}
                className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => taskId && deleteTask(taskId)}
                disabled={!taskId}
                aria-label={`Delete ${task.title ?? 'task'}`}
                className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-rose-300 ${isDark ? 'text-white/50 hover:bg-rose-500/10 hover:text-rose-300' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'}`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              {(task.description || due) && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((value) => !value)}
                  aria-label={`${expanded ? 'Hide' : 'Show'} task details`}
                  className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  {expanded
                    ? <ChevronUp size={15} aria-hidden="true" />
                    : <ChevronDown size={15} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>

          {expanded && (
            <div className={`mt-3 border-t pt-3 text-sm ${isDark ? 'border-white/10 text-white/65' : 'border-slate-200 text-slate-700'}`}>
              {task.description && <p className="whitespace-pre-wrap">{task.description}</p>}
              {dueDate && (
                <p className={`mt-2 text-xs ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
                  Due {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'full',
                    ...(task.time ? { timeStyle: 'short' as const } : {}),
                  }).format(dueDate)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default TaskItem

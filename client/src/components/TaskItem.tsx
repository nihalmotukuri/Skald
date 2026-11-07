import { useState, type KeyboardEvent } from "react";
import { CalendarDays, Check, Pencil, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/appStore";
import type { Task } from "@/types/task.ts";

type TaskProps = {
  task: Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setDisplayEditTask: (value: boolean) => void;
  setEditTaskId: (id: string) => void;
  openTaskDetails: (id: string) => void;
  deleting: boolean;
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
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const dateLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(dueDate)
  const timeLabel = task.time
    ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(dueDate)
    : null

  if (!task.completed && task.status !== 'Cancelled' && dueDate < new Date()) {
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

const TaskItem = ({ task, toggleTask, deleteTask, setDisplayEditTask, setEditTaskId, openTaskDetails, deleting }: TaskProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDark = useAppStore((state) => state.isDark)
  const due = getDueLabel(task)
  const taskId = task._id
  const cancelled = task.status === 'Cancelled'

  const edit = () => {
    if (!taskId) return
    setEditTaskId(taskId)
    setDisplayEditTask(true)
  }

  const showDetails = () => {
    if (taskId) openTaskDetails(taskId)
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    showDetails()
  }

  const remove = () => {
    if (confirmDelete && taskId) deleteTask(taskId)
    else setConfirmDelete(true)
  }

  return (
    <li
      className={`skald-task-row${task.completed ? ' is-completed' : ''}`}
      role="button"
      tabIndex={taskId ? 0 : -1}
      aria-label={`Open task: ${task.title ?? 'Untitled task'}`}
      onClick={showDetails}
      onKeyDown={handleRowKeyDown}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`${task.completed ? 'Reopen' : 'Complete'} task: ${task.title ?? 'Untitled task'}`}
          disabled={cancelled || !taskId}
          checked={Boolean(task.completed)}
          onClick={(event) => event.stopPropagation()}
          onCheckedChange={() => taskId && toggleTask(taskId)}
          className="mt-1 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className={`skald-task-row__content${task.completed ? ' is-completed' : ''}`}>
              <span className="skald-task-row__title">{task.title || 'Untitled task'}</span>
              {task.description && <span className="skald-task-row__description">{task.description}</span>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {due && (
              <span className={`skald-task-row__due${due.overdue ? ' is-overdue' : due.label.startsWith('Today') ? ' is-today' : ''}`}>
                <CalendarDays size={14} aria-hidden="true" />
                {due.label}
              </span>
            )}
            {task.taskList && (
              <span className={`rounded-full border px-2 py-0.5 text-xs ${isDark ? 'border-white/10 text-white/50' : 'border-slate-200 text-slate-500'}`}>
                {task.taskList}
              </span>
            )}
            <div className="skald-task-row__actions ml-auto flex items-center gap-1">
              {confirmDelete ? (
                <div className={`skald-task-delete-confirm ${isDark ? 'is-dark' : ''}`} role="group" aria-label={`Confirm deleting ${task.title ?? 'task'}`} onClick={(event) => event.stopPropagation()}>
                  <span>Delete?</span>
                  <button type="button" onClick={remove} disabled={deleting} aria-label="Confirm delete task">
                    <Check size={14} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  edit()
                }}
                disabled={!taskId}
                aria-label={`Edit ${task.title ?? 'task'}`}
                className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  remove()
                }}
                disabled={!taskId}
                aria-label={`Delete ${task.title ?? 'task'}`}
                className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-rose-300 ${isDark ? 'text-white/50 hover:bg-rose-500/10 hover:text-rose-300' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'}`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default TaskItem

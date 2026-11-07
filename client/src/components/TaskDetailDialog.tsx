import { CalendarDays, Check, Pencil, X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import type { Task } from '@/types/task'
import WorkspaceDialog from './WorkspaceDialog'

interface TaskDetailDialogProps {
  task: Task
  onClose: () => void
  onEdit: () => void
  onToggle: () => void
}

const formatDueDate = (task: Task) => {
  if (!task.date) return 'No due date'
  const date = new Date(`${task.date}T${task.time || '12:00'}`)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(task.time ? { timeStyle: 'short' as const } : {}),
  }).format(date)
}

const TaskDetailDialog = ({ task, onClose, onEdit, onToggle }: TaskDetailDialogProps) => {
  const isDark = useAppStore((state) => state.isDark)
  const completed = Boolean(task.completed)
  const cancelled = task.status === 'Cancelled'

  return (
    <WorkspaceDialog
      labelledBy="skald-task-detail-title"
      onClose={onClose}
      dark={isDark}
      className="skald-task-detail-dialog"
    >
      <header className="skald-task-detail-header">
        <div className="skald-task-detail-header__list">
          <span aria-hidden="true">#</span>
          <span>{task.taskList || 'Inbox'}</span>
        </div>
        <div className="skald-task-detail-header__actions">
          <button type="button" onClick={onEdit} aria-label="Edit task" title="Edit task">
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close task details" title="Close">
            <X size={19} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="skald-task-detail-layout">
        <section className="skald-task-detail-main">
          <div className="skald-task-detail-title-row">
            <button
              type="button"
              className={`skald-task-detail-complete${completed ? ' is-completed' : ''}`}
              onClick={onToggle}
              disabled={cancelled}
              aria-label={completed ? 'Reopen task' : 'Complete task'}
            >
              {completed && <Check size={14} aria-hidden="true" />}
            </button>
            <h2 id="skald-task-detail-title">{task.title || 'Untitled task'}</h2>
          </div>
          <div className="skald-task-detail-description">
            {task.description
              ? <p>{task.description}</p>
              : <p className="is-empty">No description yet.</p>}
          </div>
          {task.date && (
            <p className="skald-task-detail-due">
              <CalendarDays size={15} aria-hidden="true" />
              {formatDueDate(task)}
            </p>
          )}
        </section>

        <aside className="skald-task-detail-properties" aria-label="Task properties">
          <div className="skald-task-detail-property">
            <span>List</span>
            <strong>{task.taskList || 'Inbox'}</strong>
          </div>
          <div className="skald-task-detail-property">
            <span>Due date</span>
            <strong>{formatDueDate(task)}</strong>
          </div>
          <div className="skald-task-detail-property">
            <span>Priority</span>
            <strong>{task.priority || 'Medium'}</strong>
          </div>
          <div className="skald-task-detail-property">
            <span>Status</span>
            <strong>{task.status || 'Pending'}</strong>
          </div>
        </aside>
      </div>
    </WorkspaceDialog>
  )
}

export default TaskDetailDialog

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useTasks, useTaskMutations } from '@/queries/tasks'
import type { Task } from '@/types/task'
import SelectStatus from './SelectStatus'
import SelectPriority from './SelectPriority'
import SelectTaskList from './SelectTaskList'
import WorkspaceDialog from './WorkspaceDialog'

interface EditTaskDialogProps {
  setDisplayEditTask: (value: boolean) => void
  editTaskId: string
}

const EditTaskDialog = ({ setDisplayEditTask, editTaskId }: EditTaskDialogProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const { data: tasks = [] } = useTasks(userId)
  const { editTask } = useTaskMutations(userId)
  const task = tasks.find((item) => item._id === editTaskId)
  const [editedTask, setEditedTask] = useState<Task | null>(() => task ?? null)

  const update = (patch: Partial<Task>) => {
    setEditedTask((previous) => previous ? { ...previous, ...patch } : previous)
  }

  const selectStatus = (status: string) => {
    const completed = status === 'Done'
    update({ status, completed, completedAt: completed ? new Date() : null })
  }

  const onEditTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editedTask) return
    editTask.mutate(editedTask, { onSuccess: () => setDisplayEditTask(false) })
  }

  return (
    <WorkspaceDialog labelledBy="skald-task-dialog-title" onClose={() => setDisplayEditTask(false)} dark={isDark}>
      {editedTask ? (
        <form onSubmit={onEditTask} className="skald-task-dialog__form">
          <header className="skald-task-dialog__header">
            <div>
              <h2 id="skald-task-dialog-title">Edit task</h2>
            </div>
            <button type="button" className="skald-task-dialog__close" aria-label="Close edit task" onClick={() => setDisplayEditTask(false)}>
              <X aria-hidden="true" size={17} />
            </button>
          </header>

          <div className="skald-task-dialog__field">
            <label htmlFor="skald-edit-task-title">Title <span aria-hidden="true">*</span></label>
            <input
              autoFocus
              id="skald-edit-task-title"
              className="skald-task-dialog__input"
              type="text"
              maxLength={300}
              value={editedTask.title ?? ''}
              onChange={(event) => update({ title: event.target.value })}
              required
            />
          </div>

          <div className="skald-task-dialog__field">
            <label htmlFor="skald-edit-task-description">Description</label>
            <textarea
              id="skald-edit-task-description"
              className="skald-task-dialog__input skald-task-dialog__description"
              rows={4}
              value={editedTask.description ?? ''}
              onChange={(event) => update({ description: event.target.value })}
            />
          </div>

          <div className="skald-task-dialog__grid">
            <div className="skald-task-dialog__field">
              <label htmlFor="skald-edit-task-date">Due date</label>
              <input
                id="skald-edit-task-date"
                className="skald-task-dialog__input"
                type="date"
                value={editedTask.date ?? ''}
                onChange={(event) => update({ date: event.target.value })}
              />
            </div>
            <div className="skald-task-dialog__field">
              <label htmlFor="skald-edit-task-time">Time</label>
              <input
                id="skald-edit-task-time"
                className="skald-task-dialog__input"
                type="time"
                value={editedTask.time ?? ''}
                onChange={(event) => update({ time: event.target.value })}
              />
            </div>
            <div className="skald-task-dialog__field">
              <label htmlFor="skald-edit-task-priority">Priority</label>
              <SelectPriority id="skald-edit-task-priority" selectPriority={(priority) => update({ priority })} currentPriority={editedTask.priority ?? 'Medium'} />
            </div>
          </div>

          <div className="skald-task-dialog__grid">
            <div className="skald-task-dialog__field">
              <label htmlFor="skald-edit-task-list">List</label>
              <SelectTaskList id="skald-edit-task-list" selectTaskList={(taskList) => update({ taskList })} currentTaskList={editedTask.taskList ?? ''} />
            </div>
            <div className="skald-task-dialog__field">
              <label htmlFor="skald-edit-task-status">Status</label>
              <SelectStatus selectStatus={selectStatus} currentStatus={editedTask.status ?? 'Pending'} />
            </div>
          </div>

          <button
            className="skald-task-dialog__submit"
            type="submit"
            disabled={editTask.isPending || !editedTask.title?.trim()}
          >
            {editTask.isPending ? 'Saving changes…' : 'Save changes'}
          </button>
        </form>
      ) : (
        <div className="skald-task-dialog__form">
          <header className="skald-task-dialog__header">
            <div>
              <h2 id="skald-task-dialog-title">Task unavailable</h2>
              <p>This task may have been deleted. Close this window and refresh your tasks.</p>
            </div>
            <button type="button" className="skald-task-dialog__close" aria-label="Close dialog" onClick={() => setDisplayEditTask(false)}>
              <X aria-hidden="true" size={17} />
            </button>
          </header>
        </div>
      )}
    </WorkspaceDialog>
  )
}

export default EditTaskDialog

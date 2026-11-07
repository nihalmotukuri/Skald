import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTaskMutations } from '@/queries/tasks'
import { X } from 'lucide-react'
import type { Task } from '@/types/task'
import { getWorkspacePreferences } from '@/lib/workspacePreferences'
import SelectPriority from './SelectPriority'
import SelectTaskList from './SelectTaskList'
import WorkspaceDialog from './WorkspaceDialog'

interface AddTaskDialogProps {
  setDisplayAddTask: (value: boolean) => void
  initialDate?: string
  initialTaskList?: string
}

const AddTaskDialog = ({ setDisplayAddTask, initialDate = '', initialTaskList = '' }: AddTaskDialogProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const { addTask } = useTaskMutations(userId)
  const [addTaskData, setAddTaskData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    date: initialDate,
    time: '',
    taskList: initialTaskList,
  })
  const [priority, setPriority] = useState(() => getWorkspacePreferences().defaultTaskPriority)

  const onAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newTask: Task = {
      ...addTaskData,
      priority,
    }

    addTask.mutate(newTask, {
      onSuccess: () => {
        setAddTaskData({ title: '', description: '', status: 'Pending', date: initialDate, time: '', taskList: initialTaskList })
        setPriority(getWorkspacePreferences().defaultTaskPriority)
        setDisplayAddTask(false)
      },
    })
  }

  return (
    <WorkspaceDialog labelledBy="skald-task-dialog-title" onClose={() => setDisplayAddTask(false)} dark={isDark}>
      <form onSubmit={onAddTask} className="skald-task-dialog__form">
        <header className="skald-task-dialog__header">
          <div>
            <h2 id="skald-task-dialog-title">Create a task</h2>
          </div>
          <button
            type="button"
            className="skald-task-dialog__close"
            aria-label="Close new task dialog"
            onClick={() => setDisplayAddTask(false)}
          >
            <X aria-hidden="true" size={17} />
          </button>
        </header>

        <div className="skald-task-dialog__field">
          <label htmlFor="skald-task-title">Title <span aria-hidden="true">*</span></label>
          <input
            id="skald-task-title"
            className="skald-task-dialog__input"
            type="text"
            name="title"
            maxLength={300}
            autoFocus
            autoComplete="off"
            value={addTaskData.title}
            onChange={(event) => setAddTaskData({ ...addTaskData, title: event.currentTarget.value })}
            required
          />
        </div>

        <div className="skald-task-dialog__field">
          <label htmlFor="skald-task-description">Description</label>
          <textarea
            id="skald-task-description"
            className="skald-task-dialog__input skald-task-dialog__description"
            name="description"
            rows={4}
            value={addTaskData.description}
            onChange={(event) => setAddTaskData({ ...addTaskData, description: event.currentTarget.value })}
          />
        </div>

        <div className="skald-task-dialog__grid">
          <div className="skald-task-dialog__field">
            <label htmlFor="skald-task-date">Due date</label>
            <input
              id="skald-task-date"
              className="skald-task-dialog__input"
              type="date"
              name="date"
              value={addTaskData.date}
              onChange={(event) => setAddTaskData({ ...addTaskData, date: event.currentTarget.value })}
            />
          </div>

          <div className="skald-task-dialog__field">
            <label htmlFor="skald-task-time">Time</label>
            <input
              id="skald-task-time"
              className="skald-task-dialog__input"
              type="time"
              name="time"
              value={addTaskData.time}
              onChange={(event) => setAddTaskData({ ...addTaskData, time: event.currentTarget.value })}
            />
          </div>

          <div className="skald-task-dialog__field">
            <label htmlFor="skald-task-priority">Priority</label>
            <SelectPriority
              selectPriority={(value) => {
                if (value === 'Low' || value === 'Medium' || value === 'High') setPriority(value)
              }}
              currentPriority={priority}
            />
          </div>
          <div className="skald-task-dialog__field">
            <label htmlFor="skald-task-list">List</label>
            <SelectTaskList
              selectTaskList={(taskList) => setAddTaskData({ ...addTaskData, taskList })}
              currentTaskList={addTaskData.taskList}
            />
          </div>
        </div>

        <button
          type="submit"
          className="skald-task-dialog__submit"
          disabled={addTask.isPending || !addTaskData.title.trim()}
        >
          {addTask.isPending ? 'Adding task…' : 'Add task'}
        </button>
      </form>
    </WorkspaceDialog>
  )
}

export default AddTaskDialog

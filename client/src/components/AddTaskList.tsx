import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useTaskLists, useTaskListMutations } from '@/queries/tasks'
import WorkspaceDialog from './WorkspaceDialog'

interface AddTaskListProps {
  selectedTaskList: string
  setSelectedTaskList: (value: string) => void
}

const AddTaskList = ({ selectedTaskList, setSelectedTaskList }: AddTaskListProps) => {
  const [open, setOpen] = useState(false)
  const [newTaskList, setNewTaskList] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const { data: taskLists = [], error: taskListsError, isLoading: taskListsLoading } = useTaskLists(userId)
  const { addTaskList, updateTaskList, deleteTaskList } = useTaskListMutations(userId)

  const onAddTaskList = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newTaskList.trim()
    if (!name || name.length > 80) return
    addTaskList.mutate(name, { onSuccess: () => setNewTaskList('') })
  }

  const onRenameTaskList = (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault()
    const name = editedName.trim()
    if (!name || name.length > 80) return
    updateTaskList.mutate({ id, name }, {
      onSuccess: (savedName) => {
        if (selectedTaskList === taskLists.find((list) => list.id === id)?.name) setSelectedTaskList(savedName)
        setEditingListId(null)
      },
    })
  }

  const onDeleteTaskList = (id: string) => {
    deleteTaskList.mutate(id, {
      onSuccess: () => {
        if (selectedTaskList === taskLists.find((list) => list.id === id)?.name) setSelectedTaskList('')
        setConfirmDeleteId(null)
      },
    })
  }

  return (
    <>
      <button type="button" className="skald-task-list-button skald-task-manage-button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" size={15} />
        <span>Manage lists</span>
      </button>
      {open && (
        <WorkspaceDialog labelledBy="skald-task-lists-title" onClose={() => setOpen(false)} dark={isDark} className="skald-task-lists-dialog">
          <div className="skald-task-dialog__form">
            <header className="skald-task-dialog__header">
              <div>
                <h2 id="skald-task-lists-title">Task lists</h2>
                <p>Create, rename, or remove lists. Their tasks stay in All tasks when a list is removed.</p>
              </div>
              <button type="button" className="skald-task-dialog__close" aria-label="Close task list manager" onClick={() => setOpen(false)}>
                <X aria-hidden="true" size={17} />
              </button>
            </header>

            {taskListsError && <p role="alert" className="skald-task-dialog__error">Unable to load lists: {taskListsError.message}</p>}

            <form className="skald-task-list-create" onSubmit={onAddTaskList}>
              <label className="sr-only" htmlFor="skald-task-list-new">New list name</label>
              <input
                id="skald-task-list-new"
                className="skald-task-dialog__input"
                type="text"
                maxLength={80}
                placeholder="Name a new list"
                value={newTaskList}
                onChange={(event) => setNewTaskList(event.currentTarget.value)}
                autoFocus
              />
              <button
                className="skald-task-list-action"
                type="submit"
                disabled={addTaskList.isPending || !newTaskList.trim() || taskLists.some((list) => list.name.toLowerCase() === newTaskList.trim().toLowerCase())}
              >
                <Plus aria-hidden="true" size={15} />
                Add
              </button>
            </form>

            {taskLists.length > 0 ? (
              <ul className="skald-task-list-manager">
                {taskLists.map((taskList) => (
                  <li key={taskList.id}>
                    {editingListId === taskList.id ? (
                      <form className="skald-task-list-manager__edit" onSubmit={(event) => onRenameTaskList(event, taskList.id)}>
                        <label className="sr-only" htmlFor={`task-list-name-${taskList.id}`}>Rename {taskList.name}</label>
                        <input
                          id={`task-list-name-${taskList.id}`}
                          className="skald-task-dialog__input"
                          type="text"
                          maxLength={80}
                          value={editedName}
                          onChange={(event) => setEditedName(event.currentTarget.value)}
                          autoFocus
                          required
                        />
                        <button className="skald-task-list-action" type="submit" disabled={updateTaskList.isPending || !editedName.trim()}>
                          Save
                        </button>
                        <button className="skald-task-list-icon-action" type="button" aria-label="Cancel rename" onClick={() => setEditingListId(null)}>
                          <X aria-hidden="true" size={15} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span>{taskList.name}</span>
                        {confirmDeleteId === taskList.id ? (
                          <span className="skald-task-list-manager__confirm">
                            Remove?
                            <button type="button" onClick={() => onDeleteTaskList(taskList.id)} disabled={deleteTaskList.isPending}>Yes</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)}>No</button>
                          </span>
                        ) : (
                          <span className="skald-task-list-manager__actions">
                            <button
                              className="skald-task-list-icon-action"
                              type="button"
                              aria-label={`Rename ${taskList.name}`}
                              onClick={() => {
                                setEditingListId(taskList.id)
                                setEditedName(taskList.name)
                              }}
                            >
                              <Pencil aria-hidden="true" size={14} />
                            </button>
                            <button
                              className="skald-task-list-icon-action"
                              type="button"
                              aria-label={`Remove ${taskList.name}`}
                              onClick={() => setConfirmDeleteId(taskList.id)}
                            >
                              <Trash2 aria-hidden="true" size={14} />
                            </button>
                          </span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              !taskListsError && (
                <p className="skald-task-list-manager__empty">
                  {taskListsLoading ? 'Loading lists…' : 'No lists yet. Create one above.'}
                </p>
              )
            )}
          </div>
        </WorkspaceDialog>
      )}
    </>
  )
}

export default AddTaskList

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useTasks, useTaskMutations } from '@/queries/tasks'
import type { Task } from '@/types/task'
import LoadingIndicator from '@/components/LoadingIndicator'
import TaskItem from "@/components/TaskItem.tsx";
import AddTaskDialog from "@/components/AddTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog.tsx";
import TaskListDropdown from '@/components/TaskListDropdown.tsx'
import AddTaskList from '@/components/AddTaskList.tsx'
import TaskDropdown from '@/components/TaskDropdown'
import TaskDetailDialog from '@/components/TaskDetailDialog'
import Pagination, { PAGE_SIZE } from '@/components/Pagination'
import { getWorkspacePreferences } from '@/lib/workspacePreferences'

type TaskView = 'all' | 'active' | 'today' | 'upcoming' | 'overdue' | 'completed'

const views: { id: TaskView; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'active', label: 'Active' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
]

const getTaskView = (value: string | null): TaskView =>
  views.find((view) => view.id === value)?.id ?? 'all'

const dueDateFor = (task: Task): Date | null => {
  if (!task.date) return null
  const date = new Date(`${task.date}T${task.time || '23:59'}`)
  return Number.isNaN(date.getTime()) ? null : date
}

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate()

const dateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [displayAddTask, setDisplayAddTask] = useState(false)
  const [displayEditTask, setDisplayEditTask] = useState(false)
  const [editTaskId, setEditTaskId] = useState('')
  const [taskDetailId, setTaskDetailId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTaskList, setSelectedTaskList] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [activeView, setActiveView] = useState<TaskView>(() =>
    getTaskView(searchParams.get('view') ?? getWorkspacePreferences().defaultTaskView)
  )

  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const { data: tasks = [], isLoading: loading, error } = useTasks(userId)
  const { editTask, deleteTask } = useTaskMutations(userId)
  const taskDetail = tasks.find((task) => task._id === taskDetailId)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const activeTasks = tasks.filter((task) => !task.completed && task.status !== 'Cancelled')
  const taskCounts = {
    all: tasks.length,
    active: activeTasks.length,
    today: activeTasks.filter((task) => {
      const dueDate = dueDateFor(task)
      return dueDate !== null && isSameDay(dueDate, today)
    }).length,
    upcoming: activeTasks.filter((task) => {
      const dueDate = dueDateFor(task)
      return dueDate !== null && dueDate >= tomorrow
    }).length,
    overdue: activeTasks.filter((task) => {
      const dueDate = dueDateFor(task)
      return dueDate !== null && dueDate < now
    }).length,
    completed: tasks.filter((task) => task.completed).length,
  }

  const normalizedQuery = filterQuery.trim().toLowerCase()
  const filteredTasks = tasks
    .filter((task) => !selectedTaskList || task.taskList === selectedTaskList)
    .filter((task) => !normalizedQuery
      || task.title?.toLowerCase().includes(normalizedQuery)
      || task.description?.toLowerCase().includes(normalizedQuery))
    .filter((task) => {
      const dueDate = dueDateFor(task)
      const isActive = !task.completed && task.status !== 'Cancelled'
      switch (activeView) {
        case 'active':
          return isActive
        case 'today':
          return isActive && dueDate !== null && isSameDay(dueDate, today)
        case 'upcoming':
          return isActive && dueDate !== null && dueDate >= tomorrow
        case 'overdue':
          return isActive && dueDate !== null && dueDate < now
        case 'completed':
          return task.completed
        default:
          return true
      }
    })
    .sort((first, second) => {
      if (first.completed !== second.completed) return first.completed ? 1 : -1
      const firstDue = dueDateFor(first)?.getTime() ?? Number.MAX_SAFE_INTEGER
      const secondDue = dueDateFor(second)?.getTime() ?? Number.MAX_SAFE_INTEGER
      return firstDue - secondDue
    })
  const pageCount = Math.ceil(filteredTasks.length / PAGE_SIZE)
  const displayedPage = Math.min(currentPage, Math.max(pageCount, 1))
  const visibleTasks = filteredTasks.slice(
    (displayedPage - 1) * PAGE_SIZE,
    displayedPage * PAGE_SIZE,
  )

  useEffect(() => {
    if (currentPage !== displayedPage) setCurrentPage(displayedPage)
  }, [currentPage, displayedPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [tasks.length])

  useEffect(() => {
    const requestedView = getTaskView(searchParams.get('view') ?? getWorkspacePreferences().defaultTaskView)
    setActiveView(requestedView)
    setCurrentPage(1)
    if (searchParams.has('create')) {
      setDisplayAddTask(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('create')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const currentViewLabel = views.find((view) => view.id === activeView)?.label ?? 'All tasks'

  useEffect(() => {
    setBreadcrumb(activeView === 'all' ? 'Inbox' : currentViewLabel)
  }, [activeView, currentViewLabel, setBreadcrumb])

  const changeView = (view: TaskView) => {
    setActiveView(view)
    setCurrentPage(1)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', view)
    nextParams.delete('create')
    setSearchParams(nextParams)
  }

  const toggleTask = (taskId: string) => {
    const task = tasks.find((item) => item._id === taskId)
    if (!task) return
    const completed = !task.completed
    editTask.mutate({
      ...task,
      completed,
      completedAt: completed ? new Date() : null,
      status: completed ? 'Done' : 'Pending',
    })
  }

  const pageText = isDark ? 'text-white' : 'text-slate-900'
  const mutedText = isDark ? 'text-white/55' : 'text-slate-500'

  return (
    <div className={`skald-page skald-tasks-page col-span-1 row-span-1 min-h-0 overflow-y-auto ${pageText}`}>
      {displayAddTask && (
        <AddTaskDialog
          setDisplayAddTask={setDisplayAddTask}
          initialDate={activeView === 'today' ? dateInputValue(today) : activeView === 'upcoming' ? dateInputValue(tomorrow) : ''}
          initialTaskList={selectedTaskList}
        />
      )}
      {displayEditTask && (
        <EditTaskDialog
          setDisplayEditTask={setDisplayEditTask}
          editTaskId={editTaskId}
        />
      )}
      {taskDetail && (
        <TaskDetailDialog
          task={taskDetail}
          onClose={() => setTaskDetailId('')}
          onEdit={() => {
            setEditTaskId(taskDetailId)
            setTaskDetailId('')
            setDisplayEditTask(true)
          }}
          onToggle={() => taskDetailId && toggleTask(taskDetailId)}
        />
      )}

      <header className="skald-page-header skald-task-page-header flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="skald-workspace-kicker">A little structure for the day</p>
          <h1 className="skald-page-title text-2xl font-semibold sm:text-3xl">
            {activeView === 'all' ? 'Inbox' : currentViewLabel}
          </h1>
          <p className={`skald-page-description mt-1 text-sm ${mutedText}`}>
            {activeView === 'today'
              ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(today)
              : activeView === 'completed'
                ? `${taskCounts.completed} ${taskCounts.completed === 1 ? 'task' : 'tasks'} finished`
                : `${taskCounts.active} active ${taskCounts.active === 1 ? 'task' : 'tasks'}`}
            {taskCounts.overdue > 0 && <span className="ml-2 text-rose-400">· {taskCounts.overdue} overdue</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="skald-task-list-controls">
            <TaskListDropdown
              selectedTaskList={selectedTaskList}
              setSelectedTaskList={(value) => {
                setSelectedTaskList(value)
                setCurrentPage(1)
              }}
            />
            <AddTaskList
              selectedTaskList={selectedTaskList}
              setSelectedTaskList={(value) => {
                setSelectedTaskList(value)
                setCurrentPage(1)
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setDisplayAddTask(true)}
            className="skald-add-action inline-flex items-center gap-2 text-sm font-semibold transition"
          >
            <span className="skald-add-action__icon"><Plus aria-hidden="true" size={17} /></span>
            New task
          </button>
        </div>
      </header>

      <section className="skald-task-filters" aria-label="Task filters">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TaskDropdown
            ariaLabel="Task view"
            className="skald-task-view-select"
            value={activeView}
            options={views.map((view) => ({ value: view.id, label: view.label, count: taskCounts[view.id] }))}
            onChange={(view) => changeView(getTaskView(view))}
          />

          <label className="skald-page-search skald-task-search flex min-h-10 w-full items-center gap-2 border px-3 sm:max-w-xs">
            <Search aria-hidden="true" size={16} className={mutedText} />
            <input
              type="text"
              role="searchbox"
              placeholder="Search title or description"
              aria-label="Search tasks"
              value={filterQuery}
              onChange={(event) => {
                setFilterQuery(event.target.value)
                setCurrentPage(1)
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
            />
            {filterQuery && (
              <button type="button" aria-label="Clear search" onClick={() => setFilterQuery('')}>
                <X size={15} className={mutedText} />
              </button>
            )}
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className={`mb-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm ${isDark ? 'text-rose-200' : 'text-rose-700'}`}>
          Unable to load tasks: {error.message}
        </p>
      )}

      {loading ? (
        <LoadingIndicator label="Loading tasks…" className="skald-loading-indicator--tasks" />
      ) : (
        <ul className="flex flex-col gap-2 pb-10" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              toggleTask={toggleTask}
              deleteTask={(taskId) => deleteTask.mutate(taskId)}
              setDisplayEditTask={setDisplayEditTask}
              setEditTaskId={setEditTaskId}
              openTaskDetails={setTaskDetailId}
              deleting={deleteTask.isPending}
            />
          ))}
        </ul>
      )}

      {!loading && !error && (
        <Pagination
          page={displayedPage}
          pageCount={pageCount}
          label="Task pages"
          onPageChange={setCurrentPage}
        />
      )}

      {!loading && !error && filteredTasks.length === 0 && (
        <div className="skald-page-empty skald-task-empty border px-5 py-10 text-center">
          <h3 className="font-medium">
            {tasks.length === 0
              ? 'No tasks yet'
              : activeView === 'overdue' && !filterQuery && !selectedTaskList
                ? 'You’re all caught up'
                : 'No tasks here'}
          </h3>
          <p className={`mx-auto mt-1 max-w-sm text-sm ${mutedText}`}>
            {tasks.length === 0
              ? 'Add a task to get started.'
              : filterQuery || selectedTaskList
                ? 'Try another search or task list.'
                : activeView === 'overdue'
                  ? 'There are no overdue tasks.'
                  : 'Tasks matching this view will appear here.'}
          </p>
          {tasks.length === 0 && (
            <button
              type="button"
              onClick={() => setDisplayAddTask(true)}
              className="skald-add-action skald-task-primary mt-5 inline-flex items-center gap-2 text-sm font-semibold transition"
            >
              <span className="skald-add-action__icon"><Plus size={16} aria-hidden="true" /></span>
              Create a task
            </button>
          )}
          {(filterQuery || selectedTaskList || activeView !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFilterQuery('')
                setSelectedTaskList('')
                setCurrentPage(1)
                changeView('all')
              }}
              className="skald-task-clear-filters mt-4 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Tasks

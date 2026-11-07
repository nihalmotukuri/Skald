import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Check, ListTodo, Plus, Search, X } from "lucide-react";
import { useAppStore } from '@/store/appStore'
import { useTasks, useTaskMutations } from '@/queries/tasks'
import type { Task } from '@/types/task'
import TaskItem from "@/components/TaskItem.tsx";
import AddTaskDialog from "@/components/AddTaskDialog";
import TaskSkeleton from "../components/TaskSkeleton.tsx"
import EditTaskDialog from "@/components/EditTaskDialog.tsx";
import TaskListDropdown from '@/components/TaskListDropdown.tsx'
import AddTaskList from '@/components/AddTaskList.tsx'

type TaskView = 'all' | 'active' | 'today' | 'upcoming' | 'overdue' | 'completed'

const views: { id: TaskView; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'active', label: 'Active' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
]

const dueDateFor = (task: Task): Date | null => {
  if (!task.date) return null
  const date = new Date(`${task.date}T${task.time || '23:59'}`)
  return Number.isNaN(date.getTime()) ? null : date
}

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate()

const Tasks = () => {
  const [displayAddTask, setDisplayAddTask] = useState(false)
  const [displayEditTask, setDisplayEditTask] = useState(false)
  const [editTaskId, setEditTaskId] = useState('')
  const [selectedTaskList, setSelectedTaskList] = useState('All Tasks')
  const [filterQuery, setFilterQuery] = useState('')
  const [activeView, setActiveView] = useState<TaskView>('all')
  const [quickTaskTitle, setQuickTaskTitle] = useState('')

  const userId = useAppStore((state) => state.user?.id)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const { data: tasks = [], isLoading: loading, error } = useTasks(userId)
  const { addTask, editTask, deleteTask } = useTaskMutations(userId)
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
    .filter((task) => selectedTaskList === 'All Tasks' || task.taskList === selectedTaskList)
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

  useEffect(() => {
    setBreadcrumb("To-do List")
  }, [setBreadcrumb])

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

  const createQuickTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = quickTaskTitle.trim()
    if (!title) return
    addTask.mutate({
      title,
      description: '',
      status: 'Pending',
      priority: 'Medium',
      taskList: selectedTaskList === 'All Tasks' ? '' : selectedTaskList,
    }, {
      onSuccess: () => setQuickTaskTitle(''),
    })
  }

  const pageText = isDark ? 'text-white' : 'text-slate-900'
  const mutedText = isDark ? 'text-white/55' : 'text-slate-500'
  const surface = isDark ? 'border-white/10 bg-white/[0.035]' : 'border-slate-200 bg-white'

  return (
    <div className={`col-span-1 row-span-1 min-h-0 overflow-y-auto ${pageText}`}>
      {displayAddTask && <AddTaskDialog setDisplayAddTask={setDisplayAddTask} />}
      {displayEditTask && (
        <EditTaskDialog
          setDisplayEditTask={setDisplayEditTask}
          editTaskId={editTaskId}
        />
      )}

      <header className="flex flex-col gap-5 border-b border-white/10 pb-5 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`mb-1 text-xs font-medium uppercase tracking-[0.2em] ${mutedText}`}>Your workspace</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Tasks</h1>
          <p className={`mt-1 text-sm ${mutedText}`}>
            {taskCounts.active} active {taskCounts.active === 1 ? 'task' : 'tasks'}
            {taskCounts.overdue > 0 && <span className="ml-2 text-rose-400">· {taskCounts.overdue} overdue</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TaskListDropdown
            selectedTaskList={selectedTaskList}
            setSelectedTaskList={setSelectedTaskList}
          />
          <AddTaskList />
          <button
            type="button"
            onClick={() => setDisplayAddTask(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-500 px-3 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            <Plus aria-hidden="true" size={17} />
            New task
          </button>
        </div>
      </header>

      <section className="py-5" aria-label="Task filters">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Task views">
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                role="tab"
                aria-selected={activeView === view.id}
                onClick={() => setActiveView(view.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${
                  activeView === view.id
                    ? 'bg-indigo-500/15 text-indigo-200'
                    : `${mutedText} hover:bg-white/5 hover:text-current`
                }`}
              >
                {view.label}
                <span className={`text-xs ${activeView === view.id ? 'text-indigo-200/70' : mutedText}`}>
                  {taskCounts[view.id]}
                </span>
              </button>
            ))}
          </div>

          <label className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-3 sm:max-w-xs ${surface}`}>
            <Search aria-hidden="true" size={16} className={mutedText} />
            <input
              type="search"
              placeholder="Search title or description"
              aria-label="Search tasks"
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
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

      <form onSubmit={createQuickTask} className={`mb-5 flex items-center gap-3 rounded-xl border p-3 ${surface}`}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
          {addTask.isPending ? <Check size={17} aria-label="Saving task" /> : <Plus size={18} aria-hidden="true" />}
        </div>
        <input
          type="text"
          maxLength={300}
          value={quickTaskTitle}
          onChange={(event) => setQuickTaskTitle(event.target.value)}
          placeholder={`Add a task${selectedTaskList === 'All Tasks' ? '' : ` to ${selectedTaskList}`}…`}
          aria-label="New task title"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
        />
        <button
          type="submit"
          disabled={!quickTaskTitle.trim() || addTask.isPending}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Unable to load tasks: {error.message}
        </p>
      )}

      <div className="mb-3 flex items-center gap-2">
        {activeView === 'today' ? <CalendarDays size={16} className={mutedText} /> : <ListTodo size={16} className={mutedText} />}
        <h2 className={`text-sm font-medium ${mutedText}`}>
          {views.find((view) => view.id === activeView)?.label}
          <span className="ml-2 opacity-70">({filteredTasks.length})</span>
        </h2>
      </div>

      <ul className="flex flex-col gap-2 pb-10" aria-label="Tasks">
        {loading
          ? Array.from({ length: 5 }, (_, index) => <TaskSkeleton key={index} />)
          : filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              toggleTask={toggleTask}
              deleteTask={(taskId) => deleteTask.mutate(taskId)}
              setDisplayEditTask={setDisplayEditTask}
              setEditTaskId={setEditTaskId}
            />
          ))}
      </ul>

      {!loading && !error && filteredTasks.length === 0 && (
        <div className={`rounded-2xl border px-5 py-12 text-center ${surface}`}>
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
            {activeView === 'completed' ? <Check size={21} /> : <ListTodo size={21} />}
          </div>
          <h3 className="font-medium">
            {tasks.length === 0 ? 'Start with one small task' : 'Nothing to show here'}
          </h3>
          <p className={`mx-auto mt-1 max-w-sm text-sm ${mutedText}`}>
            {tasks.length === 0
              ? 'Capture a task above, or add details like a due date and priority.'
              : filterQuery || selectedTaskList !== 'All Tasks'
                ? 'Try another search or task list.'
                : activeView === 'overdue'
                  ? 'You’re all caught up—no overdue tasks.'
                  : 'Tasks that match this view will appear here.'}
          </p>
          {(filterQuery || selectedTaskList !== 'All Tasks' || activeView !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFilterQuery('')
                setSelectedTaskList('All Tasks')
                setActiveView('all')
              }}
              className="mt-4 text-sm text-indigo-200 hover:text-white"
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

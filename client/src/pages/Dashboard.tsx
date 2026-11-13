import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useTasks, useTaskMutations } from '@/queries/tasks'
import LoadingIndicator from '@/components/LoadingIndicator'

const Dashboard = () => {
  const user = useAppStore((state) => state.user)
  const userId = user?.id
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const { data: tasks = [], isLoading, error } = useTasks(userId)
  const { editTask } = useTaskMutations(userId)
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const todayTasks = tasks
    .filter((task) => task.date?.slice(0, 10) === today && task.status !== 'Cancelled')
    .sort((first, second) => (first.time ?? '').localeCompare(second.time ?? ''))
  const completedTodayTasks = todayTasks.filter((task) => task.completed).length
  const progressCircumference = 2 * Math.PI * 12
  const progressOffset = progressCircumference * (
    1 - (todayTasks.length ? completedTodayTasks / todayTasks.length : 0)
  )
  const firstName = user?.displayName.trim().split(/\s+/)[0] || 'there'
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)

  useEffect(() => {
    setBreadcrumb('Today')
  }, [setBreadcrumb])

  const toggleTask = (task: (typeof todayTasks)[number]) => {
    if (!task._id) return
    const completed = !task.completed
    editTask.mutate({
      ...task,
      completed,
      completedAt: completed ? new Date() : null,
      status: completed ? 'Done' : 'Pending',
    })
  }

  if (isLoading) {
    return (
      <LoadingIndicator
        label="Loading today…"
        className="skald-today-page skald-loading-indicator--page"
      />
    )
  }

  return (
    <div className="skald-today-page">
      <header className="skald-today-heading">
        <div className="skald-today-heading__topline">
          <p>{dateLabel}</p>
          <Link to="/app/assistant">
            A little more clarity <Sparkles size={14} aria-hidden="true" />
          </Link>
        </div>
        <h1>{greeting}, {firstName}.</h1>
        <p className="skald-today-heading__subtitle">Here&apos;s a little room to begin.</p>
      </header>

      <Link to="/app/assistant" className="skald-today-nudge">
        <span className="skald-today-nudge__icon"><Sparkles size={19} aria-hidden="true" /></span>
        <span className="skald-today-nudge__copy">
          <span>A gentle nudge</span>
          <strong>Start with one thing. Let the rest wait.</strong>
        </span>
        <ArrowRight className="skald-today-nudge__arrow" size={18} aria-hidden="true" />
      </Link>

      {error ? (
        <p className="skald-today-error" role="alert">Unable to load today&apos;s tasks: {error.message}</p>
      ) : (
        <section className="skald-today-list" aria-labelledby="skald-today-list-title">
          <div className="skald-today-list__heading">
            <h2 id="skald-today-list-title">In your orbit</h2>
            <div className={`skald-today-list__progress-summary${
              todayTasks.length > 0 && completedTodayTasks === todayTasks.length ? ' is-complete' : ''
            }`}>
              {todayTasks.length > 0 && (
                <span
                  className="skald-today-progress"
                  role="progressbar"
                  aria-label="Today's task progress"
                  aria-valuemin={0}
                  aria-valuemax={todayTasks.length}
                  aria-valuenow={completedTodayTasks}
                  aria-valuetext={`${completedTodayTasks} of ${todayTasks.length} tasks complete`}
                >
                  <svg viewBox="0 0 28 28" aria-hidden="true">
                    <circle className="skald-today-progress__track" cx="14" cy="14" r="12" />
                    <circle
                      className="skald-today-progress__value"
                      cx="14"
                      cy="14"
                      r="12"
                      transform="rotate(-90 14 14)"
                      strokeDasharray={progressCircumference}
                      strokeDashoffset={progressOffset}
                    />
                  </svg>
                </span>
              )}
              <span>
                {todayTasks.length === 0
                  ? '0 things'
                  : completedTodayTasks === todayTasks.length
                    ? 'All clear'
                    : `${completedTodayTasks}/${todayTasks.length} done`}
              </span>
            </div>
          </div>

          {todayTasks.length > 0 ? (
            <ul>
              {todayTasks.map((task) => (
                <li key={task._id} className={task.completed ? 'is-completed' : ''}>
                  <button
                    type="button"
                    className="skald-today-task__check"
                    onClick={() => toggleTask(task)}
                    disabled={!task._id || editTask.isPending}
                    aria-label={`${task.completed ? 'Reopen' : 'Complete'} task: ${task.title ?? 'Untitled task'}`}
                    aria-pressed={Boolean(task.completed)}
                  >
                    {task.completed && <Check size={13} aria-hidden="true" />}
                  </button>
                  <span className="skald-today-task__title">{task.title || 'Untitled task'}</span>
                  {task.taskList && <span className="skald-today-task__list">{task.taskList}</span>}
                  {task.time && <time className="skald-today-task__time" dateTime={task.time}>{task.time}</time>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="skald-today-list__empty">
              <p>Your day is open.</p>
              <Link to="/app/tasks?view=today&create=1">Add a task for today <ArrowRight size={14} /></Link>
            </div>
          )}
        </section>
      )}

      <Link to="/app/assistant" className="skald-today-assistant">
        <Sparkles size={16} aria-hidden="true" />
        <span>Need a hand finding the next step?</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </div>
  )
}

export default Dashboard

import { useAppStore } from '@/store/appStore'
import { useTaskLists } from '@/queries/tasks'
import TaskDropdown from './TaskDropdown'

interface TaskListDropdownProps {
  selectedTaskList: string
  setSelectedTaskList: (value: string) => void
}

const TaskListDropdown = ({ selectedTaskList, setSelectedTaskList }: TaskListDropdownProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: taskLists = [], error, isLoading } = useTaskLists(userId)
  const options = [
    { value: '__all__', label: 'All tasks' },
    ...taskLists.map((taskList) => ({ value: `list:${taskList.id}`, label: taskList.name })),
  ]
  const selectedList = taskLists.find((taskList) => taskList.name === selectedTaskList)
  const disabled = isLoading || taskLists.length === 0 || Boolean(error)

  return (
    <div className="skald-task-list-select-wrap">
      <TaskDropdown
        ariaLabel="Filter by task list"
        className="skald-task-list-select"
        value={selectedList ? `list:${selectedList.id}` : '__all__'}
        options={options}
        onChange={(value) => setSelectedTaskList(taskLists.find((taskList) => `list:${taskList.id}` === value)?.name ?? '')}
        disabled={disabled}
        title={disabled ? 'Create a task list to enable list filtering' : 'Filter by task list'}
      />
      {error && <span className="skald-task-list-select-error" role="alert">Unable to load lists: {error.message}</span>}
    </div>
  )
}

export default TaskListDropdown

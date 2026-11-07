import { useAppStore } from '@/store/appStore'
import { useTaskLists } from '@/queries/tasks'
import TaskDropdown from './TaskDropdown'

interface SelectTaskListProps {
  selectTaskList: (value: string) => void
  currentTaskList: string
  id?: string
}

const SelectTaskList = ({ selectTaskList, currentTaskList, id = 'skald-task-list' }: SelectTaskListProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: taskLists = [], error, isLoading } = useTaskLists(userId)
  const options = [
    { value: '__none__', label: 'No list' },
    ...taskLists.map((taskList) => ({ value: `list:${taskList.id}`, label: taskList.name })),
  ]
  const selectedList = taskLists.find((taskList) => taskList.name === currentTaskList)

  return (
    <div className="skald-task-dialog__select-wrap">
      <TaskDropdown
        id={id}
        className="skald-task-dialog__input skald-task-dialog__select skald-task-dropdown--form"
        value={selectedList ? `list:${selectedList.id}` : '__none__'}
        options={options}
        onChange={(value) => selectTaskList(taskLists.find((taskList) => `list:${taskList.id}` === value)?.name ?? '')}
        ariaLabel="Task list"
        disabled={isLoading || taskLists.length === 0 || Boolean(error)}
      />
      {error && <span className="skald-task-dialog__error" role="alert">Unable to load lists: {error.message}</span>}
    </div>
  )
}

export default SelectTaskList

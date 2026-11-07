import TaskDropdown from './TaskDropdown'

interface SelectPriorityProps {
  selectPriority: (priority: string) => void
  currentPriority: string
  id?: string
}

const priorities = ['Low', 'Medium', 'High'].map((priority) => ({ value: priority, label: priority }))

const SelectPriority = ({ selectPriority, currentPriority, id = 'skald-task-priority' }: SelectPriorityProps) => (
  <TaskDropdown
    id={id}
    className="skald-task-dialog__input skald-task-dialog__select skald-task-dropdown--form"
    value={currentPriority || 'Medium'}
    options={priorities}
    onChange={selectPriority}
    ariaLabel="Priority"
  />
)

export default SelectPriority

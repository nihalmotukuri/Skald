import TaskDropdown from './TaskDropdown'

interface SelectStatusProps {
  selectStatus: (status: string) => void
  currentStatus: string | undefined
}

const statuses = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In progress' },
  { value: 'Done', label: 'Done' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const SelectStatus = ({ selectStatus, currentStatus }: SelectStatusProps) => (
  <TaskDropdown
    id="skald-edit-task-status"
    className="skald-task-dialog__input skald-task-dialog__select skald-task-dropdown--form"
    value={currentStatus ?? 'Pending'}
    options={statuses}
    onChange={selectStatus}
    ariaLabel="Status"
  />
)

export default SelectStatus

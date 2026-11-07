import { useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface TaskDropdownOption {
  value: string
  label: string
  count?: number
}

interface TaskDropdownProps {
  value: string
  options: TaskDropdownOption[]
  onChange: (value: string) => void
  ariaLabel: string
  id?: string
  title?: string
  disabled?: boolean
  className?: string
}

const TaskDropdown = ({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  title,
  disabled = false,
  className = '',
}: TaskDropdownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) setPortalContainer(triggerRef.current?.closest('dialog') ?? null)
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={`skald-dropdown-trigger ${className}`}
          aria-label={ariaLabel}
          title={title}
          disabled={disabled}
        >
          <span>{selectedOption?.label ?? options[0]?.label}</span>
          {selectedOption?.count !== undefined && (
            <span className="skald-dropdown-trigger__count">{selectedOption.count}</span>
          )}
          <ChevronDown aria-hidden="true" size={15} className="skald-dropdown-trigger__chevron" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="skald-dropdown-content" align="start" portalContainer={portalContainer}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="skald-dropdown-item"
            role="menuitemradio"
            aria-checked={option.value === value}
            onSelect={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            {option.count !== undefined && <span className="skald-dropdown-item__count">{option.count}</span>}
            {option.value === value && <Check aria-hidden="true" size={14} className="skald-dropdown-item__check" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TaskDropdown

import { useEffect, useRef, type ReactNode } from 'react'

interface WorkspaceDialogProps {
  labelledBy: string
  onClose: () => void
  children: ReactNode
  dark?: boolean
  className?: string
}

const WorkspaceDialog = ({
  labelledBy,
  onClose,
  children,
  dark = false,
  className = '',
}: WorkspaceDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousFocus = document.activeElement
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[autofocus]')?.focus()

    return () => {
      if (dialog.open) dialog.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`skald-task-dialog${dark ? ' skald-task-dialog--dark' : ''} ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {children}
    </dialog>
  )
}

export default WorkspaceDialog

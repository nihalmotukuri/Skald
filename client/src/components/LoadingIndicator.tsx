import { LoaderCircle } from 'lucide-react'

type LoadingIndicatorProps = {
  label: string
  className?: string
}

const LoadingIndicator = ({ label, className = '' }: LoadingIndicatorProps) => (
  <div
    className={`skald-loading-indicator ${className}`.trim()}
    role="status"
    aria-label={label}
    aria-busy="true"
  >
    <LoaderCircle className="skald-loading-indicator__icon" size={17} aria-hidden="true" />
    <span>{label}</span>
  </div>
)

export default LoadingIndicator

interface BrandMarkProps {
  className?: string
}

const BrandMark = ({ className = '' }: BrandMarkProps) => (
  <span className={`skald-brand-mark skald-wordmark ${className}`} aria-hidden="true">Skald</span>
)

export default BrandMark

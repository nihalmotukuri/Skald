import { ChevronLeft, ChevronRight } from 'lucide-react'

export const PAGE_SIZE = 10

type PaginationProps = {
  page: number
  pageCount: number
  label: string
  onPageChange: (page: number) => void
}

const Pagination = ({ page, pageCount, label, onPageChange }: PaginationProps) => {
  if (pageCount <= 1) return null

  const firstMiddlePage = Math.max(2, Math.min(page - 1, pageCount - 3))
  const visiblePages = pageCount <= 5
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : [...new Set([
      1,
      pageCount,
      ...Array.from(
        { length: 3 },
        (_, index) => firstMiddlePage + index,
      ),
    ])].sort((first, second) => first - second)
  const pages = visiblePages.flatMap((pageNumber, index) => {
    const previousPage = visiblePages[index - 1]
    return previousPage && pageNumber - previousPage > 1
      ? [null, pageNumber]
      : [pageNumber]
  })

  return (
    <nav className="skald-pagination" aria-label={label}>
      <button
        type="button"
        className="skald-pagination__button"
        aria-label="Previous page"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft size={15} aria-hidden="true" />
      </button>
      {pages.map((pageNumber, index) => pageNumber === null ? (
        <span key={`ellipsis-${index}`} className="skald-pagination__ellipsis" aria-hidden="true">…</span>
      ) : (
        <button
          key={pageNumber}
          type="button"
          className={`skald-pagination__button${pageNumber === page ? ' is-current' : ''}`}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        className="skald-pagination__button"
        aria-label="Next page"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination

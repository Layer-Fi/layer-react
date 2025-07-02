import classNames from 'classnames'
import { usePaginationRange, Dots } from '../../hooks/usePaginationRange/usePaginationRange'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button } from '../ui/Button/Button'
import type { ComponentProps } from 'react'

export interface PaginationProps {
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  totalCount: number
  siblingCount?: number
  hasMore?: boolean
  fetchMore?: () => void
}

/**
 * Pagination wrapped into container with spacing and positioning.
 * Use PaginationContent component, if you want to render plain pagination element
 * without spacings and positioning.
 */
export const Pagination = (props: PaginationProps) => {
  return (
    <div className='Layer__pagination-container'>
      <PaginationContent {...props} />
    </div>
  )
}

type PaginationButtonProps = ComponentProps<typeof Button>
const PaginationButton = ({ children, ...buttonProps }: PaginationButtonProps) => {
  return (
    <Button
      inset
      icon
      variant='ghost'
      {...buttonProps}
    >
      {children}
    </Button>
  )
}

export const PaginationContent = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  hasMore,
  fetchMore,
}: PaginationProps) => {
  const paginationRange = usePaginationRange({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  })

  if (!paginationRange || currentPage === 0 || paginationRange.length < 2) {
    return null
  }
  const lastPage = paginationRange[paginationRange.length - 1]

  return (
    <nav aria-label='Pagination'>
      <ul className='Layer__pagination' role='list'>
        <li key='page-prev'>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            aria-label='Previous page'
          >
            <ChevronLeft size={12} />
          </PaginationButton>
        </li>
        {paginationRange.map((pageNumber) => {
          if (pageNumber in Dots) {
            return (
              <li key={`page-${pageNumber}`}>
                <PaginationButton
                  isDisabled
                  aria-hidden='true'
                >
                  &hellip;
                </PaginationButton>
              </li>
            )
          }

          return (
            <li
              key={`page-${pageNumber}`}
              className={classNames(pageNumber === currentPage && 'Layer__pagination__selected-item')}
            >
              <PaginationButton
                aria-hidden='true'
                onClick={() => onPageChange(Number(pageNumber))}
              >
                {pageNumber}
              </PaginationButton>
            </li>
          )
        })}
        {hasMore && fetchMore
          ? (
            <li key='page-has-more'>
              <PaginationButton
                onClick={fetchMore}
                aria-label='More results'
              >
                &hellip;
              </PaginationButton>
            </li>
          )
          : null}
        <li key='page-next'>
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={currentPage === lastPage}
            aria-label='Next page'
          >
            <ChevronRight size={12} />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  )
}

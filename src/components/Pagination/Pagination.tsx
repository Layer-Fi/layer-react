import classNames from 'classnames'
import { usePaginationRange, Dots } from '../../hooks/usePaginationRange/usePaginationRange'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button } from '../ui/Button/Button'
import type { ComponentProps } from 'react'
import { VStack } from '../ui/Stack/Stack'

export interface PaginationProps {
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  totalCount: number
  siblingCount?: number
  hasMore?: boolean
  fetchMore?: () => void
  className?: string
}

type PaginationButtonProps = ComponentProps<typeof Button> & { isSelected?: boolean }
const PaginationButton = ({ children, isSelected, ...buttonProps }: PaginationButtonProps) => {
  return (
    <Button
      inset
      icon
      variant={isSelected ? 'branded' : 'ghost'}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}

export const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  hasMore,
  fetchMore,
  className,
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
    <VStack className={classNames('Layer__pagination-container', className)} fluid>
      <nav aria-label='Pagination' className='Layer__pagination-nav'>
        <ul className='Layer__pagination' role='list'>
          <li key='page-prev'>
            <PaginationButton
              onPress={() => onPageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              aria-label='Go to previous page'
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
              <li key={`page-${pageNumber}`}>
                <PaginationButton
                  isSelected={pageNumber === currentPage}
                  onPress={() => onPageChange(Number(pageNumber))}
                  aria-label={`Go to page ${pageNumber}`}
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
                  onPress={fetchMore}
                  aria-label='Get more results'
                >
                  &hellip;
                </PaginationButton>
              </li>
            )
            : null}
          <li key='page-next'>
            <PaginationButton
              onPress={() => onPageChange(currentPage + 1)}
              isDisabled={currentPage === lastPage}
              aria-label='Go to next page'
            >
              <ChevronRight size={12} />
            </PaginationButton>
          </li>
        </ul>
      </nav>
    </VStack>
  )
}

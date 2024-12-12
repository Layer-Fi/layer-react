import React from 'react'
import { usePagination, DOTS } from '../../hooks/usePagination'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import classnames from 'classnames'

export interface PaginationProps {
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  totalCount: number
  siblingCount?: number
  hasMore?: boolean
  fetchMore?: () => void
}

export const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  hasMore,
  fetchMore,
}: PaginationProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  })

  if (!paginationRange) {
    return null
  }

  if (currentPage === 0 || paginationRange.length < 2) {
    return null
  }

  const lastPage = paginationRange[paginationRange.length - 1]

  return (
    <ul className='Layer__pagination'>
      <li
        key='page-prev'
        className={classnames(
          'Layer__pagination-item Layer__pagination-arrow Layer__pagination-arrow--previous',
          {
            disabled: currentPage === 1,
          },
        )}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={12} />
      </li>
      {paginationRange.map((pageNumber, idx) => {
        if (pageNumber === DOTS) {
          return (
            <li
              key={`${idx}-page-${pageNumber}`}
              className='Layer__pagination-item Layer__pagination-dots'
            >
              &#8230;
            </li>
          )
        }

        return (
          <li
            key={`page-${pageNumber}`}
            className={classnames('Layer__pagination-item', {
              selected: pageNumber === currentPage,
            })}
            onClick={() => {
              if (typeof pageNumber === 'number') {
                onPageChange(pageNumber)
                if (pageNumber === lastPage && hasMore && fetchMore) {
                  fetchMore()
                }
              }
            }}
          >
            {pageNumber}
          </li>
        )
      })}
      {hasMore && fetchMore
        ? (
          <li
            key='page-has-more'
            className='Layer__pagination-item Layer__pagination-arrow Layer__pagination-arrow--next'
            onClick={fetchMore}
          >
            ...
          </li>
        )
        : null}
      <li
        key='page-last'
        className={classnames(
          'Layer__pagination-item Layer__pagination-arrow Layer__pagination-arrow--next',
          {
            disabled: currentPage === lastPage,
          },
        )}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={12} />
      </li>
    </ul>
  )
}

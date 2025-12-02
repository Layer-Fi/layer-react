import { useMemo } from 'react'

import { range } from '@utils/helpers'

export enum Dots {
  DotsLeft = 'DotsLeft',
  DotsRight = 'DotsRight',
}

export interface UsePaginationProps {
  totalCount: number
  pageSize: number
  siblingCount?: number
  currentPage: number
}

export type UsePaginationReturn = (Dots | number)[]

export const usePaginationRange = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: UsePaginationProps): UsePaginationReturn => {
  if (pageSize < 1) throw new Error('pageSize must be a positive integer >= 1')

  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize)
    if (totalPageCount === 0) return []

    const staticRange = siblingCount * 2 + 3

    if (totalPageCount <= staticRange + 2) {
      return range(1, totalPageCount)
    }

    const showFullLeftRange = currentPage <= siblingCount + 3
    const showFullRightRange = currentPage >= totalPageCount - siblingCount - 2

    const leftRange =
      showFullLeftRange
        ? range(1, staticRange)
        : [1, Dots.DotsLeft]

    const middleRange = !showFullLeftRange && !showFullRightRange
      ? range(currentPage - siblingCount, currentPage + siblingCount)
      : []

    const rightRange =
      showFullRightRange
        ? range(totalPageCount - staticRange + 1, totalPageCount)
        : [Dots.DotsRight, totalPageCount]

    return [...leftRange, ...middleRange, ...rightRange]
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

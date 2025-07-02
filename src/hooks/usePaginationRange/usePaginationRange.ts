import { useMemo } from 'react'
import { range } from '../../utils/helpers'

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
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize)
    const staticRange = siblingCount * 2 + 3
    if (totalCount === 0) return []

    if (totalPageCount <= staticRange) {
      return range(1, totalPageCount)
    }

    const leftRange =
      currentPage <= siblingCount + 2
        ? range(1, staticRange)
        : [1, Dots.DotsLeft]

    const middleRange = currentPage > siblingCount + 2 && currentPage < totalPageCount - siblingCount - 1
      ? range(currentPage - siblingCount, currentPage + siblingCount)
      : []

    const rightRange =
      currentPage >= totalPageCount - siblingCount - 1
        ? range(totalPageCount - staticRange + 1, totalPageCount)
        : [Dots.DotsRight, totalPageCount]

    return [...leftRange, ...middleRange, ...rightRange]
  }, [totalCount, pageSize, siblingCount, currentPage])

  return paginationRange
}

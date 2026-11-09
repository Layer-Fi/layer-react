import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { usePaginatedTableState } from '@blocks/Table/PaginatedDataTable/usePaginatedTableState'

type UsePaginatedTableStateParams = Parameters<typeof usePaginatedTableState>[0]

const renderPaginatedTableState = (initialProps: Partial<UsePaginatedTableStateParams> = {}) => {
  const rendered = renderHook(
    (props: Partial<UsePaginatedTableStateParams>) => usePaginatedTableState({ pageSize: 2, ...props }),
    { initialProps },
  )

  return {
    ...rendered,
    rerender: (nextProps: Partial<UsePaginatedTableStateParams>) => rendered.rerender({ ...initialProps, ...nextProps }),
  }
}

describe('usePaginatedTableState', () => {
  describe('uncontrolled pagination', () => {
    it('starts on the first page', () => {
      const { result } = renderPaginatedTableState()

      expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 2 })
    })

    it('a plain pagination value updates the page and reports it as a sync change', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginatedTableState({ onPageIndexChange })

      act(() => result.current.onPaginationChange({ pageIndex: 1, pageSize: 2 }))

      expect(result.current.pagination.pageIndex).toBe(1)
      expect(onPageIndexChange).toHaveBeenCalledWith(1, PaginationChangeSource.Sync)
    })

    it('an updater function computes the next page from the current pagination', () => {
      const { result } = renderPaginatedTableState()

      act(() => result.current.onPaginationChange(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 })))

      expect(result.current.pagination.pageIndex).toBe(1)
    })

    it('marks the next pagination change as user-driven, then resets to sync afterward', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginatedTableState({ onPageIndexChange })

      act(() => result.current.changePaginationSource(PaginationChangeSource.User))
      act(() => result.current.onPaginationChange({ pageIndex: 1, pageSize: 2 }))

      expect(onPageIndexChange).toHaveBeenCalledWith(1, PaginationChangeSource.User)

      onPageIndexChange.mockClear()
      act(() => result.current.onPaginationChange({ pageIndex: 2, pageSize: 2 }))

      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.Sync)
    })

    it('clamps down to the new last page when the data shrinks', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginatedTableState({ data: [1, 2, 3, 4, 5, 6], onPageIndexChange })

      act(() => result.current.onPaginationChange({ pageIndex: 2, pageSize: 2 }))
      expect(result.current.pagination.pageIndex).toBe(2)

      rerender({ data: [1, 2] })

      expect(result.current.pagination.pageIndex).toBe(0)
      expect(onPageIndexChange).toHaveBeenLastCalledWith(0, PaginationChangeSource.Sync)
    })
  })

  describe('controlled pagination', () => {
    it('does not change its own page index; the caller must pass a new pageIndex', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginatedTableState({ pageIndex: 0, onPageIndexChange })

      act(() => result.current.onPaginationChange({ pageIndex: 1, pageSize: 2 }))

      expect(onPageIndexChange).toHaveBeenCalledWith(1, PaginationChangeSource.Sync)
      expect(result.current.pagination.pageIndex).toBe(0)

      rerender({ pageIndex: 1 })

      expect(result.current.pagination.pageIndex).toBe(1)
    })
  })

  describe('clamping against data', () => {
    it('clamps a requested page index past the last page down to the last page', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginatedTableState({ pageIndex: 5, data: [1, 2, 3, 4, 5], onPageIndexChange })

      expect(result.current.pagination.pageIndex).toBe(2)
      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.Sync)
    })

    it('does not clamp when there is no data yet', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginatedTableState({ pageIndex: 10, onPageIndexChange })

      expect(result.current.pagination.pageIndex).toBe(10)
      expect(onPageIndexChange).not.toHaveBeenCalled()
    })
  })
})

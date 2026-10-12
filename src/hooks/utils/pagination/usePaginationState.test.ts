import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { usePaginationState } from '@hooks/utils/pagination/usePaginationState'

type UsePaginationStateProps = Parameters<typeof usePaginationState>[0]

const DATA: readonly number[] = [1, 2, 3]

const renderPaginationState = (initialProps: Partial<UsePaginationStateProps> = {}) => {
  const rendered = renderHook(
    (props: Partial<UsePaginationStateProps>) => usePaginationState({ pageCount: 5, data: DATA, ...props }),
    { initialProps },
  )

  return {
    ...rendered,
    rerender: (nextProps: Partial<UsePaginationStateProps>) => rendered.rerender({ ...initialProps, ...nextProps }),
  }
}

describe('usePaginationState', () => {
  describe('when the hook keeps track of the current page itself', () => {
    it('starts on the first page', () => {
      const { result } = renderPaginationState()

      expect(result.current.pageIndex).toBe(0)
    })

    it('going to page 3 moves to index 2 and tells the caller the user changed the page', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginationState({ onPageIndexChange })

      act(() => result.current.onPageChange(3))

      expect(result.current.pageIndex).toBe(2)
      expect(onPageIndexChange).toHaveBeenCalledOnce()
      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.User)
    })

    it('going past the last page stops on the last page', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginationState({ pageCount: 3, onPageIndexChange })

      act(() => result.current.onPageChange(10))

      expect(result.current.pageIndex).toBe(2)
      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.User)
    })

    it('setPage counts pages from 0, so setPage(3) moves to index 3', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginationState({ onPageIndexChange })

      act(() => result.current.setPage(3, PaginationChangeSource.User))

      expect(result.current.pageIndex).toBe(3)
      expect(onPageIndexChange).toHaveBeenCalledWith(3, PaginationChangeSource.User)
    })

    it('stays on the first page when there are no pages', () => {
      const { result } = renderPaginationState({ pageCount: 0, data: [] })

      act(() => result.current.onPageChange(2))

      expect(result.current.pageIndex).toBe(0)
    })

    it('moves back to the new last page when the number of pages shrinks', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginationState({ onPageIndexChange })

      act(() => result.current.onPageChange(5))
      expect(result.current.pageIndex).toBe(4)

      rerender({ pageCount: 2 })

      expect(result.current.pageIndex).toBe(1)
      expect(onPageIndexChange).toHaveBeenLastCalledWith(1, PaginationChangeSource.Sync)
    })
  })

  describe('when the caller passes in the current page', () => {
    it('asks the caller to change the page instead of changing it directly', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginationState({ pageIndex: 1, onPageIndexChange })

      act(() => result.current.onPageChange(3))

      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.User)
      expect(result.current.pageIndex).toBe(1)

      rerender({ pageIndex: 2 })

      expect(result.current.pageIndex).toBe(2)
    })

    it('shows the last page and tells the caller when the page passed in is past the end', () => {
      const onPageIndexChange = vi.fn()
      const { result } = renderPaginationState({ pageCount: 3, pageIndex: 7, onPageIndexChange })

      expect(result.current.pageIndex).toBe(2)
      expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.Sync)
    })
  })

  describe('when new data arrives', () => {
    it('goes back to the first page if the filters changed', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginationState({ autoResetPageIndexRef: { current: true }, onPageIndexChange })

      act(() => result.current.onPageChange(3))
      expect(result.current.pageIndex).toBe(2)

      rerender({ data: [4, 5, 6] })

      expect(result.current.pageIndex).toBe(0)
      expect(onPageIndexChange).toHaveBeenLastCalledWith(0, PaginationChangeSource.Sync)
    })

    it('stays on the current page if the filters did not change', () => {
      const onPageIndexChange = vi.fn()
      const { result, rerender } = renderPaginationState({ autoResetPageIndexRef: { current: false }, onPageIndexChange })

      act(() => result.current.onPageChange(3))

      rerender({ data: [4, 5, 6] })

      expect(result.current.pageIndex).toBe(2)
      expect(onPageIndexChange).toHaveBeenCalledOnce()
    })
  })
})

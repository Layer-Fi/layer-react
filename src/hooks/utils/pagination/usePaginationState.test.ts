import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { usePaginationState } from '@hooks/utils/pagination/usePaginationState'

describe('usePaginationState', () => {
  it('starts at page index 0 in uncontrolled mode', () => {
    const { result } = renderHook(() => usePaginationState({ pageCount: 5, data: [1, 2, 3] }))

    expect(result.current.pageIndex).toBe(0)
  })

  it('advances to the requested page and reports it as user-sourced', () => {
    const onPageIndexChange = vi.fn()
    const { result } = renderHook(() => usePaginationState({
      pageCount: 5,
      data: [1, 2, 3],
      onPageIndexChange,
    }))

    act(() => result.current.onPageChange(3))

    expect(result.current.pageIndex).toBe(2)
    expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.User)
  })

  it('clamps navigation to the last page when the requested page exceeds pageCount', () => {
    const { result } = renderHook(() => usePaginationState({ pageCount: 3, data: [1, 2, 3] }))

    act(() => result.current.onPageChange(10))

    expect(result.current.pageIndex).toBe(2)
  })

  it('in controlled mode, defers to the caller instead of updating its own page index', () => {
    const onPageIndexChange = vi.fn()
    const { result, rerender } = renderHook(
      (props: { pageIndex: number }) => usePaginationState({
        pageCount: 5,
        data: [1, 2, 3],
        pageIndex: props.pageIndex,
        onPageIndexChange,
      }),
      { initialProps: { pageIndex: 1 } },
    )

    act(() => result.current.onPageChange(3))

    expect(onPageIndexChange).toHaveBeenCalledWith(2, PaginationChangeSource.User)
    expect(result.current.pageIndex).toBe(1)

    rerender({ pageIndex: 2 })

    expect(result.current.pageIndex).toBe(2)
  })

  it('auto-clamps the page index down when pageCount shrinks below the current page', () => {
    const onPageIndexChange = vi.fn()
    const { result, rerender } = renderHook(
      (props: { pageCount: number }) => usePaginationState({
        pageCount: props.pageCount,
        data: [1, 2, 3],
        onPageIndexChange,
      }),
      { initialProps: { pageCount: 5 } },
    )

    act(() => result.current.onPageChange(5))
    expect(result.current.pageIndex).toBe(4)

    rerender({ pageCount: 2 })

    expect(result.current.pageIndex).toBe(1)
    expect(onPageIndexChange).toHaveBeenCalledWith(1, PaginationChangeSource.Sync)
  })

  it('resets to the first page when data changes while an auto-reset is pending', () => {
    const onPageIndexChange = vi.fn()
    const autoResetPageIndexRef = { current: true }
    const { result, rerender } = renderHook(
      (props: { data: readonly number[] }) => usePaginationState({
        pageCount: 5,
        data: props.data,
        autoResetPageIndexRef,
        onPageIndexChange,
      }),
      { initialProps: { data: [1, 2, 3] } },
    )

    act(() => result.current.onPageChange(3))
    expect(result.current.pageIndex).toBe(2)

    rerender({ data: [4, 5, 6] })

    expect(result.current.pageIndex).toBe(0)
    expect(onPageIndexChange).toHaveBeenCalledWith(0, PaginationChangeSource.Sync)
  })
})

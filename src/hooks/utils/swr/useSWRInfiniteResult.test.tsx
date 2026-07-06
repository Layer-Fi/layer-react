import { renderHook } from '@testing-library/react'
import { type SWRInfiniteResponse } from 'swr/infinite'
import { describe, expect, it, vi } from 'vitest'

import { SWRInfiniteResult } from '@internal-types/swr/SWRResponseTypes'
import type { PaginatedResponse } from '@schemas/common/pagination'
import { useSWRInfiniteResult } from '@hooks/utils/swr/useSWRInfiniteResult'

type Page = PaginatedResponse<{ id: string }>

const makePage = (ids: string[], cursor: string | null): Page => ({
  data: ids.map(id => ({ id })),
  meta: { pagination: { cursor, hasMore: cursor !== null, totalCount: ids.length } },
})

const makeResponse = (pages: Page[] | undefined, setSize = vi.fn()) =>
  ({
    data: pages,
    isLoading: false,
    isValidating: false,
    error: undefined,
    mutate: vi.fn(),
    size: pages?.length ?? 0,
    setSize,
  } as unknown as SWRInfiniteResponse<Page>)

describe('useSWRInfiniteResult', () => {
  it('returns an SWRInfiniteResult wrapping the response', () => {
    const { result } = renderHook(() => useSWRInfiniteResult(makeResponse([makePage(['1'], null)])))
    expect(result.current).toBeInstanceOf(SWRInfiniteResult)
  })

  it('flattens the data across pages', () => {
    const pages = [makePage(['1', '2'], 'next'), makePage(['3'], null)]
    const { result } = renderHook(() => useSWRInfiniteResult(makeResponse(pages)))

    expect(result.current.flattenedData).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }])
  })

  it('fetchMore increments the size when more pages remain', () => {
    const setSize = vi.fn()
    const { result } = renderHook(() =>
      useSWRInfiniteResult(makeResponse([makePage(['1'], 'next')], setSize)),
    )

    result.current.fetchMore()

    expect(setSize).toHaveBeenCalledTimes(1)
    const increment = setSize.mock.calls[0][0] as (size: number) => number
    expect(increment(1)).toBe(2)
  })

  it('fetchMore is a no-op on the last page', () => {
    const setSize = vi.fn()
    const { result } = renderHook(() =>
      useSWRInfiniteResult(makeResponse([makePage(['1'], null)], setSize)),
    )

    result.current.fetchMore()

    expect(setSize).not.toHaveBeenCalled()
  })

  it('keeps flattenedData referentially stable while the pages are unchanged', () => {
    const pages = [makePage(['1'], null)]
    const { result, rerender } = renderHook(
      (response: SWRInfiniteResponse<Page>) => useSWRInfiniteResult(response),
      { initialProps: makeResponse(pages) },
    )

    const first = result.current.flattenedData
    rerender(makeResponse(pages))
    expect(result.current.flattenedData).toBe(first)
  })
})

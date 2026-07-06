import { type SWRResponse } from 'swr'
import { type SWRInfiniteResponse } from 'swr/infinite'
import { type SWRMutationResponse } from 'swr/mutation'
import { describe, expect, it, vi } from 'vitest'

import { SWRInfiniteResult, SWRMutationResult, SWRQueryResult } from '@internal-types/swr/SWRResponseTypes'
import type { PaginatedResponse } from '@schemas/common/pagination'

describe('SWRQueryResult', () => {
  const baseResponse = {
    data: { id: 'w1' },
    isLoading: false,
    isValidating: false,
    error: undefined,
    mutate: vi.fn(),
  } as unknown as SWRResponse<{ id: string }>

  it('exposes the underlying response fields', () => {
    const result = new SWRQueryResult(baseResponse)
    expect(result.data).toEqual({ id: 'w1' })
    expect(result.isLoading).toBe(false)
    expect(result.isValidating).toBe(false)
  })

  it('reports isError based on the presence of an error', () => {
    expect(new SWRQueryResult(baseResponse).isError).toBe(false)

    const errored = { ...baseResponse, error: new Error('boom') } as SWRResponse<{ id: string }>
    const result = new SWRQueryResult(errored)
    expect(result.isError).toBe(true)
    expect(result.error).toBeInstanceOf(Error)
  })

  it('aliases refetch to mutate', () => {
    const result = new SWRQueryResult(baseResponse)
    expect(result.refetch).toBe(baseResponse.mutate)
    expect(result.mutate).toBe(baseResponse.mutate)
  })
})

type Page = PaginatedResponse<{ id: string }>

const makePage = (ids: string[], cursor: string | null): Page => ({
  data: ids.map(id => ({ id })),
  meta: { pagination: { cursor, hasMore: cursor !== null, totalCount: ids.length } },
})

describe('SWRInfiniteResult', () => {
  const pages = [makePage(['1', '2'], 'next')]
  const setSize = vi.fn()
  const swrResponse = {
    data: pages,
    isLoading: false,
    isValidating: false,
    error: undefined,
    mutate: vi.fn(),
    size: 1,
    setSize,
  } as unknown as SWRInfiniteResponse<Page>

  const fetchMore = vi.fn()
  const flattened = [{ id: '1' }, { id: '2' }]

  it('exposes flattened data and the injected fetchMore', () => {
    const result = new SWRInfiniteResult(swrResponse, fetchMore, flattened)
    expect(result.data).toBe(pages)
    expect(result.flattenedData).toBe(flattened)
    expect(result.fetchMore).toBe(fetchMore)
  })

  it('derives hasMore from the last page pagination', () => {
    expect(new SWRInfiniteResult(swrResponse, fetchMore, flattened).hasMore).toBe(true)

    const noMore = { ...swrResponse, data: [makePage(['1'], null)] } as SWRInfiniteResponse<Page>
    expect(new SWRInfiniteResult(noMore, fetchMore, flattened).hasMore).toBe(false)
  })

  it('exposes size and setSize from the underlying response', () => {
    const result = new SWRInfiniteResult(swrResponse, fetchMore, flattened)
    expect(result.size).toBe(1)
    expect(result.setSize).toBe(setSize)
  })

  it('reports isError and aliases refetch to mutate', () => {
    const result = new SWRInfiniteResult(swrResponse, fetchMore, flattened)
    expect(result.isError).toBe(false)
    expect(result.refetch).toBe(swrResponse.mutate)
  })
})

describe('SWRMutationResult', () => {
  const trigger = vi.fn()
  const reset = vi.fn()
  const swrResponse = {
    data: { id: 'w1' },
    trigger,
    isMutating: false,
    error: undefined,
    reset,
  } as unknown as SWRMutationResponse<{ id: string }>

  it('exposes data, trigger, isMutating, and reset', () => {
    const result = new SWRMutationResult(swrResponse)
    expect(result.data).toEqual({ id: 'w1' })
    expect(result.trigger).toBe(trigger)
    expect(result.isMutating).toBe(false)
    expect(result.reset).toBe(reset)
  })

  it('reports isError based on the error', () => {
    expect(new SWRMutationResult(swrResponse).isError).toBe(false)

    const errored = { ...swrResponse, error: new Error('boom') } as unknown as SWRMutationResponse<{ id: string }>
    const result = new SWRMutationResult(errored)
    expect(result.isError).toBe(true)
    expect(result.error).toBeInstanceOf(Error)
  })
})

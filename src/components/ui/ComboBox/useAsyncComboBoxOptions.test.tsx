import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AsyncComboBoxFetchOptions, ComboBoxOption } from '@ui/ComboBox/types'
import { useAsyncComboBoxOptions } from '@ui/ComboBox/useAsyncComboBoxOptions'

const DEBOUNCE_WAIT = 300

function buildOptions(page: number): ReadonlyArray<ComboBoxOption> {
  return [{ label: `Option ${page}`, value: `option-${page}` }]
}

async function flushPendingPromises() {
  await act(async () => {})
}

describe('useAsyncComboBoxOptions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches options for the empty input on mount', async () => {
    const fetchOptions = vi.fn<AsyncComboBoxFetchOptions<ComboBoxOption>>()
      .mockResolvedValue({ options: buildOptions(1) })

    const { result } = renderHook(() => useAsyncComboBoxOptions({ fetchOptions }))

    expect(result.current.isLoading).toBe(true)

    await flushPendingPromises()

    expect(fetchOptions).toHaveBeenCalledExactlyOnceWith({ inputValue: '' })
    expect(result.current.options).toEqual(buildOptions(1))
    expect(result.current.isLoading).toBe(false)
  })

  it('refetches with the debounced input value', async () => {
    const fetchOptions = vi.fn<AsyncComboBoxFetchOptions<ComboBoxOption>>()
      .mockResolvedValue({ options: buildOptions(1) })

    const { result } = renderHook(() => useAsyncComboBoxOptions({ fetchOptions }))
    await flushPendingPromises()

    act(() => {
      result.current.onInputValueChange('que')
    })
    act(() => {
      result.current.onInputValueChange('query')
    })

    expect(fetchOptions).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_WAIT)
    })

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(fetchOptions).toHaveBeenLastCalledWith({ inputValue: 'query' })
  })

  it('appends the next page on scroll to bottom when a cursor is present', async () => {
    const fetchOptions = vi.fn<AsyncComboBoxFetchOptions<ComboBoxOption>>()
      .mockResolvedValueOnce({ options: buildOptions(1), nextCursor: 'cursor-1' })
      .mockResolvedValueOnce({ options: buildOptions(2) })

    const { result } = renderHook(() => useAsyncComboBoxOptions({ fetchOptions }))
    await flushPendingPromises()

    act(() => {
      result.current.onMenuScrollToBottom()
    })
    await flushPendingPromises()

    expect(fetchOptions).toHaveBeenLastCalledWith({ inputValue: '', cursor: 'cursor-1' })
    expect(result.current.options).toEqual([...buildOptions(1), ...buildOptions(2)])

    act(() => {
      result.current.onMenuScrollToBottom()
    })
    await flushPendingPromises()

    expect(fetchOptions).toHaveBeenCalledTimes(2)
  })

  it('ignores an in-flight page when the input changes before it resolves', async () => {
    let resolveSecondPage = (_: { options: ReadonlyArray<ComboBoxOption> }) => {}

    const fetchOptions = vi.fn<AsyncComboBoxFetchOptions<ComboBoxOption>>()
      .mockResolvedValueOnce({ options: buildOptions(1), nextCursor: 'cursor-1' })
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveSecondPage = resolve
      }))
      .mockResolvedValue({ options: buildOptions(3) })

    const { result } = renderHook(() => useAsyncComboBoxOptions({ fetchOptions }))
    await flushPendingPromises()

    act(() => {
      result.current.onMenuScrollToBottom()
    })
    act(() => {
      result.current.onInputValueChange('query')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_WAIT)
    })

    act(() => {
      resolveSecondPage({ options: buildOptions(2) })
    })
    await flushPendingPromises()

    expect(result.current.options).toEqual(buildOptions(3))
  })

  it('reports an error when the fetch fails and recovers on the next fetch', async () => {
    const fetchOptions = vi.fn<AsyncComboBoxFetchOptions<ComboBoxOption>>()
      .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValue({ options: buildOptions(1) })

    const { result } = renderHook(() => useAsyncComboBoxOptions({ fetchOptions }))
    await flushPendingPromises()

    expect(result.current.isError).toBe(true)

    act(() => {
      result.current.onInputValueChange('query')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_WAIT)
    })

    expect(result.current.isError).toBe(false)
    expect(result.current.options).toEqual(buildOptions(1))
  })
})

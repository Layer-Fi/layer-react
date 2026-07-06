import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'zustand'

import { createScopedStore } from '@utils/zustand/createScopedStore'

type CounterStore = {
  count: number
  increment: () => void
}

function createCounterScopedStore() {
  return createScopedStore({
    createStore: () => createStore<CounterStore>(set => ({
      count: 0,
      increment: () => set(({ count }) => ({ count: count + 1 })),
    })),
    storeName: 'CounterStore',
  })
}

function useCounterTestState(scopedStore: ReturnType<typeof createCounterScopedStore>) {
  return {
    count: scopedStore.useSelector(({ count }) => count),
    increment: scopedStore.useSelector(({ increment }) => increment),
  }
}

describe('createScopedStore', () => {
  it('provides store state and actions through the provider', () => {
    const scopedStore = createCounterScopedStore()

    const { result } = renderHook(
      () => useCounterTestState(scopedStore),
      { wrapper: scopedStore.Provider },
    )

    expect(result.current.count).toBe(0)

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  it('isolates state between two mounted providers of the same store', () => {
    const scopedStore = createCounterScopedStore()

    const { result: first } = renderHook(
      () => useCounterTestState(scopedStore),
      { wrapper: scopedStore.Provider },
    )
    const { result: second } = renderHook(
      () => useCounterTestState(scopedStore),
      { wrapper: scopedStore.Provider },
    )

    act(() => {
      first.current.increment()
    })

    expect(first.current.count).toBe(1)
    expect(second.current.count).toBe(0)
  })

  it('throws a descriptive error when a hook is used outside its provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const scopedStore = createCounterScopedStore()

    expect(() => renderHook(() => scopedStore.useSelector(({ count }) => count)))
      .toThrow('CounterStore hooks must be used within CounterStore.Provider')

    consoleError.mockRestore()
  })
})

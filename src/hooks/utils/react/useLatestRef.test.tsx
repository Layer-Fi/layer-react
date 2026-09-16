import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useLatestRef } from '@hooks/utils/react/useLatestRef'

describe('useLatestRef', () => {
  it('exposes the initial value on first render', () => {
    const { result } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'first' },
    })

    expect(result.current.current).toBe('first')
  })

  it('keeps a stable ref whose current reflects the latest value after a rerender', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'first' },
    })
    const ref = result.current

    rerender({ value: 'second' })

    expect(result.current).toBe(ref)
    expect(ref.current).toBe('second')
  })
})

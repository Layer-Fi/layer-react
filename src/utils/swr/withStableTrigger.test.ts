import { describe, expect, it, vi } from 'vitest'

import { withStableTrigger } from '@utils/swr/withStableTrigger'

type FakeResponse = {
  trigger: (arg: string) => string
  data?: string
  isMutating: boolean
  error?: unknown
}

describe('withStableTrigger', () => {
  it('swaps in the supplied trigger', () => {
    const original = vi.fn((arg: string) => `original:${arg}`)
    const replacement = vi.fn((arg: string) => `replacement:${arg}`)
    const response: FakeResponse = { trigger: original, isMutating: false }

    const wrapped = withStableTrigger(response, replacement)

    expect(wrapped.trigger('x')).toBe('replacement:x')
    expect(replacement).toHaveBeenCalledWith('x')
    expect(original).not.toHaveBeenCalled()
  })

  it('delegates other properties to the live response', () => {
    const response: FakeResponse = { trigger: () => 'x', isMutating: false, data: 'a' }
    const wrapped = withStableTrigger(response, () => 'y')

    expect(wrapped.data).toBe('a')
    expect(wrapped.isMutating).toBe(false)

    // Mutating the underlying response is reflected through the proxy.
    response.isMutating = true
    response.data = 'b'
    response.error = new Error('boom')

    expect(wrapped.isMutating).toBe(true)
    expect(wrapped.data).toBe('b')
    expect(wrapped.error).toBeInstanceOf(Error)
  })

  it('keeps the same trigger reference across reads', () => {
    const replacement = () => 'y'
    const wrapped = withStableTrigger({ trigger: () => 'x', isMutating: false }, replacement)

    expect(wrapped.trigger).toBe(wrapped.trigger)
    expect(wrapped.trigger).toBe(replacement)
  })
})

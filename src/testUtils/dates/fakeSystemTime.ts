import { afterEach, beforeEach, vi } from 'vitest'

export function setupFakeSystemTime(now: Date) {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })
}

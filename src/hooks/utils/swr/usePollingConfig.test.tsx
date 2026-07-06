import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@testing-library/react'
import useSWR, { SWRConfig } from 'swr'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'

type PollData = { status: 'pending' | 'done', version?: number }
const PENDING: PollData = { status: 'pending' }
const DONE: PollData = { status: 'done' }

const DEFAULT_INTERVAL = 2000
const DEFAULT_MAX_DURATION = 2 * 60 * 1000

type PollingOptions = Parameters<typeof usePollingConfig<PollData>>[0]

const defaultShouldContinue = (data?: PollData) => data?.status === 'pending'

const renderPollingConfig = (overrides: Partial<PollingOptions> = {}) => {
  const opts: PollingOptions = { shouldContinue: defaultShouldContinue, ...overrides }
  return renderHook(() => usePollingConfig(opts))
}

type Result = ReturnType<typeof renderPollingConfig>['result']

/** `refreshInterval` is a function in this hook; call it with the latest data. */
const callRefresh = (result: Result, data?: PollData) =>
  (result.current.refreshInterval as (d?: PollData) => number)(data)

const callSuccess = (result: Result, data: PollData) => {
  act(() => result.current.onSuccess?.(data, 'key', {} as never))
}

/** Invoke `onErrorRetry` with sensible defaults; overrides for retryCount. */
const callErrorRetry = (
  result: Result,
  revalidate: ReturnType<typeof vi.fn>,
  { error = new Error('boom'), retryCount = 0 }: { error?: unknown, retryCount?: number } = {},
) =>
  result.current.onErrorRetry?.(
    error,
    'key',
    {} as never,
    revalidate as never,
    { retryCount } as never,
  )

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('usePollingConfig', () => {
  describe('refreshInterval', () => {
    it('returns 0 when shouldContinue is false', () => {
      const { result } = renderPollingConfig()
      expect(callRefresh(result, DONE)).toBe(0)
    })

    it('transitions idle -> active and returns the default interval while shouldContinue is true', () => {
      const { result } = renderPollingConfig()
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('respects a custom numeric interval', () => {
      const { result } = renderPollingConfig({ intervalMs: 500 })
      expect(callRefresh(result, PENDING)).toBe(500)
    })

    it('supports a function that computes the interval per poll', () => {
      const intervalMs = vi.fn(() => 1234)
      const { result } = renderPollingConfig({ intervalMs })
      expect(callRefresh(result, PENDING)).toBe(1234)
      expect(intervalMs).toHaveBeenCalled()
    })

    it('stops polling once the max duration has elapsed', () => {
      const { result } = renderPollingConfig()

      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL) // idle -> active, deadline set

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0) // deadline reached -> stopped
    })

    it('remains stopped on subsequent calls even while shouldContinue is true', () => {
      const { result } = renderPollingConfig()
      callRefresh(result, PENDING)
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)
      expect(callRefresh(result, PENDING)).toBe(0)
    })
  })

  describe('onErrorRetry', () => {
    it('retries after one interval while under the retry limit', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ intervalMs: 500 })

      callErrorRetry(result, revalidate, { retryCount: 0 })
      expect(revalidate).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 })
    })

    it('gives up immediately on a fatal error', () => {
      const revalidate = vi.fn()
      const isFatalError = vi.fn(() => true)
      const { result } = renderPollingConfig({ isFatalError })

      callErrorRetry(result, revalidate)
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
      expect(callRefresh(result, PENDING)).toBe(0) // stopped
    })

    it('gives up after the maximum number of retries', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ maxErrorRetries: 3 })

      callErrorRetry(result, revalidate, { retryCount: 3 })
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('gives up once the max polling duration has elapsed', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig()

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      callErrorRetry(result, revalidate)
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
    })

    it('does nothing once polling has already stopped', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ isFatalError: () => true })

      callErrorRetry(result, revalidate) // fatal -> stopped
      callErrorRetry(result, revalidate, { error: new Error('again'), retryCount: 0 })
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
    })
  })

  describe('onSuccess', () => {
    it('notifies onPoll with each successful result', () => {
      const onPoll = vi.fn()
      const { result } = renderPollingConfig({ onPoll })

      callSuccess(result, PENDING)

      expect(onPoll).toHaveBeenCalledWith(PENDING)
    })

    it('restarts an idle session on success, bumping refreshInterval identity so SWR revives its polling loop', () => {
      const { result } = renderPollingConfig()
      const before = result.current.refreshInterval

      callSuccess(result, PENDING)

      expect(result.current.refreshInterval).not.toBe(before) // nonce bumped
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL) // active
    })

    it('calls onComplete exactly once when shouldContinue goes false (default completion)', () => {
      const onComplete = vi.fn()
      const { result } = renderPollingConfig({ onComplete })

      callSuccess(result, DONE)
      callSuccess(result, DONE)

      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(DONE)
    })

    it('defers completion to a custom shouldComplete predicate', () => {
      const onComplete = vi.fn()
      const shouldComplete = vi.fn((d: PollData) => d.version === 2)
      const { result } = renderPollingConfig({ onComplete, shouldComplete })

      callSuccess(result, { status: 'pending', version: 1 })
      expect(onComplete).not.toHaveBeenCalled()

      callSuccess(result, { status: 'pending', version: 2 })
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not revive a stopped session when shouldContinue was already true (no rising edge)', () => {
      const { result } = renderPollingConfig()

      // idle -> active via a poll, then let the deadline stop it.
      callSuccess(result, PENDING)
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0) // stopped
      const stopped = result.current.refreshInterval

      // Another "still pending" poll is not progress (prev was already pending).
      callSuccess(result, PENDING)

      expect(result.current.refreshInterval).toBe(stopped) // no restart
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('restarts a stopped session when shouldRestartPolling sees progress', () => {
      const shouldRestartPolling = vi.fn(
        (prev: PollData | undefined, next: PollData) => prev?.version !== next.version,
      )
      const { result } = renderPollingConfig({ shouldRestartPolling })

      callSuccess(result, { status: 'pending', version: 1 })
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0) // stopped

      callSuccess(result, { status: 'pending', version: 2 })

      expect(shouldRestartPolling).toHaveBeenLastCalledWith({ status: 'pending', version: 1 }, { status: 'pending', version: 2 })
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL) // revived
    })

    it('extends the deadline when shouldRestartPolling reports progress while active', () => {
      const shouldRestartPolling = (prev: PollData | undefined, next: PollData) => prev?.version !== next.version
      const { result } = renderPollingConfig({ shouldRestartPolling })

      callSuccess(result, { status: 'pending', version: 1 }) // active, deadline = 120000

      vi.setSystemTime(DEFAULT_MAX_DURATION - 1000)
      callSuccess(result, { status: 'pending', version: 2 }) // extends to 239000

      vi.setSystemTime(DEFAULT_MAX_DURATION + 1000) // past original deadline, before extended
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('treats maxDurationMs as a hard cap by default, since still-pending polls are not progress', () => {
      const { result } = renderPollingConfig()

      callSuccess(result, { status: 'pending', version: 1 }) // active, deadline = 120000

      // A steady stream of still-pending polls does not extend the deadline.
      vi.setSystemTime(DEFAULT_MAX_DURATION - 1000)
      callSuccess(result, { status: 'pending', version: 2 })

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)
    })
  })

  describe('return value', () => {
    it('returns the same { refreshInterval, onErrorRetry, onSuccess } object across re-renders', () => {
      const opts: PollingOptions = { shouldContinue: defaultShouldContinue }
      const { result, rerender } = renderHook(() => usePollingConfig(opts))

      const first = result.current
      expect(Object.keys(first).sort()).toEqual(['onErrorRetry', 'onSuccess', 'refreshInterval'])

      rerender()
      expect(result.current).toBe(first)
    })
  })

  describe('when driving useSWR', () => {
    const INTERVAL = 1000

    const swrWrapper = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
    )

    const renderPolledSWR = (
      key: string,
      fetcher: () => Promise<PollData>,
      overrides: Partial<PollingOptions> = {},
    ) =>
      renderHook(
        () => {
          const config = usePollingConfig<PollData>({
            shouldContinue: defaultShouldContinue,
            intervalMs: INTERVAL,
            ...overrides,
          })
          return useSWR(key, fetcher, config)
        },
        { wrapper: swrWrapper },
      )

    const advance = async (ms: number) => {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms)
      })
    }

    it('polls at the interval until shouldContinue goes false, then halts and completes once', async () => {
      let response: PollData = PENDING
      const fetcher = vi.fn(() => Promise.resolve(response))
      const onComplete = vi.fn()

      renderPolledSWR('poll-lifecycle', fetcher, { onComplete })

      await advance(0) // mount fetch
      expect(fetcher).toHaveBeenCalledTimes(1)

      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(2)

      response = DONE
      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(DONE)

      // Terminal data halts the loop: no further fetches.
      await advance(INTERVAL * 5)
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('resumes polling when a refetch finds a new pending session after the loop has died', async () => {
      let response: PollData = DONE
      const fetcher = vi.fn(() => Promise.resolve(response))

      const { result } = renderPolledSWR('poll-revival', fetcher)

      await advance(0) // mount fetch returns done -> loop never starts
      await advance(INTERVAL * 3)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // A new session begins: an external refetch observes pending data...
      response = PENDING
      await act(async () => {
        await result.current.mutate()
      })
      expect(fetcher).toHaveBeenCalledTimes(2)

      // ...and the restart nonce revives SWR's polling loop.
      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(3)
    })

    it('halts at maxDurationMs while shouldContinue is still true', async () => {
      const fetcher = vi.fn(() => Promise.resolve(PENDING))

      renderPolledSWR('poll-deadline', fetcher, { maxDurationMs: INTERVAL * 3 })

      await advance(0) // mount fetch
      await advance(INTERVAL * 10)

      const haltedCount = fetcher.mock.calls.length
      expect(haltedCount).toBeLessThan(6) // capped well below the 10 ticks elapsed

      await advance(INTERVAL * 5)
      expect(fetcher).toHaveBeenCalledTimes(haltedCount) // no further polls
    })
  })
})

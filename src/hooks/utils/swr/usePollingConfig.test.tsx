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

const callErrorRetry = (
  result: Result,
  revalidate: ReturnType<typeof vi.fn>,
  { error = new Error('boom'), retryCount = 1 }: { error?: unknown, retryCount?: number } = {},
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

    it('starts polling before any data arrives when shouldContinue accepts undefined', () => {
      const { result } = renderPollingConfig({
        shouldContinue: data => data === undefined || data.status === 'pending',
      })
      expect(callRefresh(result, undefined)).toBe(DEFAULT_INTERVAL)
    })

    it('returns a numeric intervalMs override', () => {
      const { result } = renderPollingConfig({ intervalMs: 500 })
      expect(callRefresh(result, PENDING)).toBe(500)
    })

    it('invokes a function-form intervalMs on each scheduling call', () => {
      const intervalMs = vi.fn(() => 1234)
      const { result } = renderPollingConfig({ intervalMs })
      expect(callRefresh(result, PENDING)).toBe(1234)
      expect(intervalMs).toHaveBeenCalled()
    })

    it('transitions active -> stopped and returns 0 once maxDurationMs elapses', () => {
      const { result } = renderPollingConfig()

      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)
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
    it('schedules revalidate after one interval, preserving retryCount, while under maxErrorRetries', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ intervalMs: 500 })

      callErrorRetry(result, revalidate, { retryCount: 1 })
      expect(revalidate).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 1 })
    })

    it('still retries when retryCount equals maxErrorRetries (SWR retryCount is 1-based)', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ maxErrorRetries: 3 })

      callErrorRetry(result, revalidate, { retryCount: 3 })
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).toHaveBeenCalledWith({ retryCount: 3 })
    })

    it('stops retrying once retryCount exceeds maxErrorRetries', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ maxErrorRetries: 3 })

      callErrorRetry(result, revalidate, { retryCount: 4 })
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('stops the session without retrying when isFatalError matches', () => {
      const revalidate = vi.fn()
      const isFatalError = vi.fn(() => true)
      const { result } = renderPollingConfig({ isFatalError })

      callErrorRetry(result, revalidate)
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('stops retrying once the polling deadline has passed', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig()

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      callErrorRetry(result, revalidate)
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
    })

    it('is a no-op when the session is already stopped', () => {
      const revalidate = vi.fn()
      const { result } = renderPollingConfig({ isFatalError: () => true })

      callErrorRetry(result, revalidate)
      callErrorRetry(result, revalidate, { error: new Error('again'), retryCount: 1 })
      vi.advanceTimersByTime(DEFAULT_INTERVAL)

      expect(revalidate).not.toHaveBeenCalled()
    })
  })

  describe('onSuccess', () => {
    it('invokes onPoll with every successful payload', () => {
      const onPoll = vi.fn()
      const { result } = renderPollingConfig({ onPoll })

      callSuccess(result, PENDING)

      expect(onPoll).toHaveBeenCalledWith(PENDING)
    })

    it('restarts an idle session, bumping refreshInterval identity so SWR revives its polling loop', () => {
      const { result } = renderPollingConfig()
      const before = result.current.refreshInterval

      callSuccess(result, PENDING)

      expect(result.current.refreshInterval).not.toBe(before)
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('does not revive a stopped session when shouldContinue was already true (no rising edge)', () => {
      const { result } = renderPollingConfig()

      callSuccess(result, PENDING)
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)
      const stopped = result.current.refreshInterval

      callSuccess(result, PENDING)

      expect(result.current.refreshInterval).toBe(stopped)
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('revives a stopped session on the default rising edge (terminal, then pending again)', () => {
      const { result } = renderPollingConfig()

      callSuccess(result, PENDING)
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)

      callSuccess(result, DONE)
      callSuccess(result, PENDING)

      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('revives a stopped session when shouldRestartPolling reports progress', () => {
      const shouldRestartPolling = vi.fn(
        (prev: PollData | undefined, next: PollData) => prev?.version !== next.version,
      )
      const { result } = renderPollingConfig({ shouldRestartPolling })

      callSuccess(result, { status: 'pending', version: 1 })
      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)

      callSuccess(result, { status: 'pending', version: 2 })

      expect(shouldRestartPolling).toHaveBeenLastCalledWith({ status: 'pending', version: 1 }, { status: 'pending', version: 2 })
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('extends the deadline when shouldRestartPolling reports progress while active', () => {
      const shouldRestartPolling = (prev: PollData | undefined, next: PollData) => prev?.version !== next.version
      const { result } = renderPollingConfig({ shouldRestartPolling })

      callSuccess(result, { status: 'pending', version: 1 })

      vi.setSystemTime(DEFAULT_MAX_DURATION - 1000)
      callSuccess(result, { status: 'pending', version: 2 })

      vi.setSystemTime(DEFAULT_MAX_DURATION + 1000) // past original deadline, before extended
      expect(callRefresh(result, PENDING)).toBe(DEFAULT_INTERVAL)
    })

    it('treats maxDurationMs as a hard cap by default, since still-pending polls are not progress', () => {
      const { result } = renderPollingConfig()

      callSuccess(result, { status: 'pending', version: 1 })

      vi.setSystemTime(DEFAULT_MAX_DURATION - 1000)
      callSuccess(result, { status: 'pending', version: 2 })

      vi.setSystemTime(DEFAULT_MAX_DURATION)
      expect(callRefresh(result, PENDING)).toBe(0)
    })

    it('calls onComplete exactly once when an active session ends (default completion)', () => {
      const onComplete = vi.fn()
      const { result } = renderPollingConfig({ onComplete })

      callSuccess(result, PENDING)
      callSuccess(result, DONE)
      callSuccess(result, DONE)

      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(DONE)
    })

    it('does not fire default completion when the first fetch is already terminal (no session ran)', () => {
      const onComplete = vi.fn()
      const { result } = renderPollingConfig({ onComplete })

      callSuccess(result, DONE)

      expect(onComplete).not.toHaveBeenCalled()
    })

    it('re-arms completion per session: a restarted session completes again', () => {
      const onComplete = vi.fn()
      const { result } = renderPollingConfig({ onComplete })

      callSuccess(result, PENDING)
      callSuccess(result, DONE)
      expect(callRefresh(result, DONE)).toBe(0) // natural end -> idle
      callSuccess(result, PENDING)
      callSuccess(result, DONE)

      expect(onComplete).toHaveBeenCalledTimes(2)
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
  })

  describe('returned config', () => {
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
    /** DEFAULT_SWR_CONFIG's app-wide refresh; the hook-level polling function must override it. */
    const GLOBAL_REFRESH_INTERVAL = 10 * 60 * 1000

    const swrWrapper = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, refreshInterval: GLOBAL_REFRESH_INTERVAL }}>
        {children}
      </SWRConfig>
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

      await advance(0)
      expect(fetcher).toHaveBeenCalledTimes(1)

      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(2)

      response = DONE
      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(DONE)

      await advance(INTERVAL * 5)
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('revives the dead SWR polling loop when a refetch surfaces a new pending session', async () => {
      let response: PollData = DONE
      const fetcher = vi.fn(() => Promise.resolve(response))

      const { result } = renderPolledSWR('poll-revival', fetcher)

      await advance(0)
      await advance(INTERVAL * 3)
      expect(fetcher).toHaveBeenCalledTimes(1)

      response = PENDING
      await act(async () => {
        await result.current.mutate()
      })
      expect(fetcher).toHaveBeenCalledTimes(2)

      await advance(INTERVAL)
      expect(fetcher).toHaveBeenCalledTimes(3)
    })

    it('halts at maxDurationMs while shouldContinue is still true', async () => {
      const fetcher = vi.fn(() => Promise.resolve(PENDING))

      renderPolledSWR('poll-deadline', fetcher, { maxDurationMs: INTERVAL * 3 })

      await advance(0)
      await advance(INTERVAL * 10)

      const haltedCount = fetcher.mock.calls.length
      expect(haltedCount).toBeLessThan(6) // capped well below the 10 ticks elapsed

      await advance(INTERVAL * 5)
      expect(fetcher).toHaveBeenCalledTimes(haltedCount)
    })

    it('retries a failing fetch at the interval, then gives up after maxErrorRetries retries', async () => {
      const fetcher = vi.fn(() => Promise.reject(new Error('boom')))

      renderPolledSWR('poll-errors', fetcher, { maxErrorRetries: 3 })

      await advance(0)
      expect(fetcher).toHaveBeenCalledTimes(1)

      await advance(INTERVAL * 10)
      expect(fetcher).toHaveBeenCalledTimes(4) // initial attempt + 3 retries

      await advance(INTERVAL * 5)
      expect(fetcher).toHaveBeenCalledTimes(4)
    })
  })
})

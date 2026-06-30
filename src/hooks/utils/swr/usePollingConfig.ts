import { useCallback, useMemo, useRef } from 'react'
import { type SWRConfiguration } from 'swr'

import type { Awaitable } from '@internal-types/utility/promises'
import { isActive, isIdle, isStopped, PollingPhase } from '@hooks/utils/swr/pollingPhase'

const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_POLL_DURATION_MS = 2 * 60 * 1000
const DEFAULT_MAX_ERROR_RETRIES = 3

type UsePollingConfigOptions<TData> = {
  shouldContinue: (nextData: TData | undefined) => boolean
  /** Gates the one-shot `onComplete`. Defaults to `!shouldContinue`. */
  shouldComplete?: (nextData: TData) => boolean
  /** Resets the `maxDurationMs` deadline when true, turning it into a stall timeout. */
  shouldResetPollingDeadline?: (previousTData: TData | undefined, nextData: TData) => boolean
  onPoll?: (nextData: TData) => Awaitable<void>
  onComplete?: (nextData: TData) => Awaitable<void>
  isFatalError?: (error: unknown) => boolean
  intervalMs?: number | (() => number)
  maxDurationMs?: number
  maxErrorRetries?: number
}

export function usePollingConfig<TData>({
  shouldContinue,
  shouldComplete,
  shouldResetPollingDeadline,
  onPoll,
  onComplete,
  isFatalError,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxDurationMs = DEFAULT_MAX_POLL_DURATION_MS,
  maxErrorRetries = DEFAULT_MAX_ERROR_RETRIES,
}: UsePollingConfigOptions<TData>): Pick<
    SWRConfiguration<TData>,
  'refreshInterval' | 'onErrorRetry' | 'onSuccess'
  > {
  const phaseRef = useRef<PollingPhase>(PollingPhase.Idle)
  const hasCompletedRef = useRef(false)
  const previousDataRef = useRef<TData>()
  const pollingEndTimestampRef = useRef(Date.now() + maxDurationMs)

  const getInterval = useCallback(
    () => (typeof intervalMs === 'function' ? intervalMs() : intervalMs),
    [intervalMs],
  )

  const restartPolling = useCallback(() => {
    phaseRef.current = PollingPhase.Active
    hasCompletedRef.current = false
    previousDataRef.current = undefined
    pollingEndTimestampRef.current = Date.now() + maxDurationMs
  }, [maxDurationMs])

  const refreshInterval = useCallback((nextData?: TData) => {
    if (!shouldContinue(nextData)) {
      phaseRef.current = PollingPhase.Idle
      return 0
    }

    if (isIdle(phaseRef)) restartPolling()

    if (isStopped(phaseRef)) return 0

    if (Date.now() >= pollingEndTimestampRef.current) {
      phaseRef.current = PollingPhase.Stopped
      return 0
    }

    return getInterval()
  }, [getInterval, restartPolling, shouldContinue])

  const onErrorRetry = useCallback<NonNullable<SWRConfiguration<TData>['onErrorRetry']>>(
    (error, _key, _config, revalidate, { retryCount }) => {
      if (isStopped(phaseRef)) return

      const isAtMaxRetries = retryCount >= maxErrorRetries
      const isPastPollingDeadline = Date.now() >= pollingEndTimestampRef.current

      if (isFatalError?.(error) || isAtMaxRetries || isPastPollingDeadline) {
        phaseRef.current = PollingPhase.Stopped
        return
      }

      setTimeout(() => {
        void revalidate({ retryCount })
      }, getInterval())
    },
    [getInterval, isFatalError, maxErrorRetries],
  )

  const onSuccess = useCallback((nextData: TData) => {
    void onPoll?.(nextData)

    if (isActive(phaseRef) && shouldResetPollingDeadline?.(previousDataRef.current, nextData)) {
      pollingEndTimestampRef.current = Date.now() + maxDurationMs
    }

    previousDataRef.current = nextData

    const completed = shouldComplete ? shouldComplete(nextData) : !shouldContinue(nextData)
    if (!hasCompletedRef.current && completed) {
      hasCompletedRef.current = true
      void onComplete?.(nextData)
    }
  }, [onPoll, onComplete, shouldContinue, shouldComplete, shouldResetPollingDeadline, maxDurationMs])

  return useMemo(
    () => ({ refreshInterval, onErrorRetry, onSuccess }),
    [onErrorRetry, onSuccess, refreshInterval],
  )
}

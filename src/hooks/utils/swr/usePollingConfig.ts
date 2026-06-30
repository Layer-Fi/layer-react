import { useCallback, useMemo, useRef } from 'react'
import { type SWRConfiguration } from 'swr'

import type { Awaitable } from '@internal-types/utility/promises'

const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_POLL_DURATION_MS = 2 * 60 * 1000
const DEFAULT_MAX_ERROR_RETRIES = 3

type UsePollingConfigOptions<Data> = {
  shouldContinue: (latestData: Data | undefined) => boolean
  onPoll?: (latestData: Data) => Awaitable<void>
  onComplete?: (latestData: Data) => Awaitable<void>
  isFatalError?: (error: unknown) => boolean
  intervalMs?: number | (() => number)
  maxDurationMs?: number
  maxErrorRetries?: number
}

export function usePollingConfig<Data>({
  shouldContinue,
  onPoll,
  onComplete,
  isFatalError,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxDurationMs = DEFAULT_MAX_POLL_DURATION_MS,
  maxErrorRetries = DEFAULT_MAX_ERROR_RETRIES,
}: UsePollingConfigOptions<Data>): Pick<
    SWRConfiguration<Data>,
  'refreshInterval' | 'onErrorRetry' | 'onSuccess'
  > {
  const hasStoppedPollingRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const pollingEndTimestampRef = useRef(Date.now() + maxDurationMs)

  const getInterval = useCallback(
    () => (typeof intervalMs === 'function' ? intervalMs() : intervalMs),
    [intervalMs],
  )

  const refreshInterval = useCallback((latestData?: Data) => {
    if (hasStoppedPollingRef.current) return 0

    if (Date.now() >= pollingEndTimestampRef.current) {
      hasStoppedPollingRef.current = true
      return 0
    }

    return shouldContinue(latestData) ? getInterval() : 0
  }, [getInterval, shouldContinue])

  const onErrorRetry = useCallback<NonNullable<SWRConfiguration<Data>['onErrorRetry']>>(
    (error, _key, _config, revalidate, { retryCount }) => {
      if (hasStoppedPollingRef.current) return

      const isAtMaxRetries = retryCount >= maxErrorRetries
      const isPastPollingDeadline = Date.now() >= pollingEndTimestampRef.current

      if (isFatalError?.(error) || isAtMaxRetries || isPastPollingDeadline) {
        hasStoppedPollingRef.current = true
        return
      }

      setTimeout(() => {
        void revalidate({ retryCount })
      }, getInterval())
    },
    [getInterval, isFatalError, maxErrorRetries],
  )

  const onSuccess = useCallback((latestData: Data) => {
    void onPoll?.(latestData)

    if (!hasCompletedRef.current && !shouldContinue(latestData)) {
      hasCompletedRef.current = true
      void onComplete?.(latestData)
    }
  }, [onPoll, onComplete, shouldContinue])

  return useMemo(
    () => ({ refreshInterval, onErrorRetry, onSuccess }),
    [onErrorRetry, onSuccess, refreshInterval],
  )
}

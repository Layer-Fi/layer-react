import { useCallback, useMemo, useRef, useState } from 'react'
import { type SWRConfiguration } from 'swr'

import type { Awaitable } from '@internal-types/utility/promises'
import { isActive, isIdle, isStopped, PollingPhase } from '@hooks/utils/swr/pollingPhase'

const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_POLL_DURATION_MS = 2 * 60 * 1000
const DEFAULT_MAX_ERROR_RETRIES = 3

type UsePollingConfigOptions<TData> = {
  shouldContinue: (nextData: TData | undefined) => boolean
  shouldComplete?: (nextData: TData) => boolean
  shouldRestartPolling?: (previousData: TData | undefined, nextData: TData) => boolean
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
  shouldRestartPolling,
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
  /*
   * SWR's polling loop, once `refreshInterval` returns 0, only restarts when the
   * polling effect re-runs — i.e. when `refreshInterval`'s identity changes (its
   * deps are [refreshInterval, ...], not the fetched data). This nonce is a
   * dependency of `refreshInterval`, so bumping it forces that re-run to revive a
   * halted session (see onSuccess).
   */
  const [restartNonce, setRestartNonce] = useState(0)

  const getInterval = useCallback(
    () => (typeof intervalMs === 'function' ? intervalMs() : intervalMs),
    [intervalMs],
  )

  const restartPolling = useCallback(() => {
    phaseRef.current = PollingPhase.Active
    hasCompletedRef.current = false
    pollingEndTimestampRef.current = Date.now() + maxDurationMs
  }, [maxDurationMs])

  const refreshInterval = useCallback((nextData?: TData) => {
    // Read so this callback's identity tracks restartNonce (see its declaration).
    void restartNonce

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
  }, [getInterval, restartPolling, shouldContinue, restartNonce])

  const onErrorRetry = useCallback<NonNullable<SWRConfiguration<TData>['onErrorRetry']>>(
    (error, _key, _config, revalidate, { retryCount }) => {
      if (isStopped(phaseRef)) return

      // SWR passes a 1-based retryCount, so `>` yields exactly `maxErrorRetries` retries.
      const isAtMaxRetries = retryCount > maxErrorRetries
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

    const hasProgress = shouldRestartPolling
      ? shouldRestartPolling(previousDataRef.current, nextData)
      : !shouldContinue(previousDataRef.current) && shouldContinue(nextData)

    const shouldRestart = (isIdle(phaseRef) && shouldContinue(nextData)) || (isStopped(phaseRef) && hasProgress)

    if (shouldRestart) {
      restartPolling()
      setRestartNonce(nonce => nonce + 1)
    }
    else if (isActive(phaseRef) && hasProgress) {
      pollingEndTimestampRef.current = Date.now() + maxDurationMs
    }

    previousDataRef.current = nextData

    /*
     * Default completion means an actual session ended: data that is already terminal on
     * the first fetch (phase still Idle) is "nothing to poll", not "finished". A custom
     * `shouldComplete` is an explicit definition of done, so it applies regardless.
     */
    const completed = shouldComplete
      ? shouldComplete(nextData)
      : !isIdle(phaseRef) && !shouldContinue(nextData)
    if (!hasCompletedRef.current && completed) {
      hasCompletedRef.current = true
      void onComplete?.(nextData)
    }
  }, [onPoll, onComplete, restartPolling, shouldContinue, shouldComplete, shouldRestartPolling, maxDurationMs])

  return useMemo(
    () => ({ refreshInterval, onErrorRetry, onSuccess }),
    [onErrorRetry, onSuccess, refreshInterval],
  )
}

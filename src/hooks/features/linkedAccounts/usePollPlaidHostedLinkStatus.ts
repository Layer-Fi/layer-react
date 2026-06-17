import { useCallback, useEffect, useRef } from 'react'
import { type SWRConfiguration } from 'swr'

import type { Awaitable } from '@internal-types/utility/promises'
import { type ApiPlaidHostedLinkStatus, PlaidHostedLinkState } from '@schemas/linkedAccounts/plaid'
import { APIError } from '@utils/api/apiError'
import { usePlaidHostedLinkStatus } from '@hooks/api/businesses/[business-id]/plaid/hosted-link'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_DURATION_MS = 2 * 60 * 1000
const MAX_ERROR_RETRIES = 3

const TERMINAL_STATES: ReadonlySet<PlaidHostedLinkState> = new Set([
  PlaidHostedLinkState.NOT_STARTED,
  PlaidHostedLinkState.SUCCEEDED,
  PlaidHostedLinkState.EXITED,
  PlaidHostedLinkState.FAILED,
  PlaidHostedLinkState.UNKNOWN,
])

const isTerminal = (state: PlaidHostedLinkState | undefined) =>
  state !== undefined && TERMINAL_STATES.has(state)

const isFatalError = (error: unknown) =>
  error instanceof APIError && error.code != null && error.code >= 400 && error.code < 500

type UsePollPlaidHostedLinkStatusOptions = {
  onSuccess: () => Awaitable<void>
  enabled: boolean
}

export function usePollPlaidHostedLinkStatus({ onSuccess, enabled }: UsePollPlaidHostedLinkStatusOptions) {
  const hasStoppedPollingRef = useRef(false)
  const pollingEndTimestampRef = useRef(Date.now() + MAX_POLL_DURATION_MS)
  const hasFiredOnSuccessRef = useRef(false)

  const getRefreshInterval = useCallback(() => {
    if (hasStoppedPollingRef.current || Date.now() >= pollingEndTimestampRef.current) {
      hasStoppedPollingRef.current = true
      return 0
    }

    return POLL_INTERVAL_MS
  }, [])

  const onErrorRetry = useCallback<NonNullable<SWRConfiguration<ApiPlaidHostedLinkStatus>['onErrorRetry']>>(
    (error, _key, _config, revalidate, { retryCount }) => {
      if (hasStoppedPollingRef.current) return

      const isAtMaxRetries = retryCount >= MAX_ERROR_RETRIES
      const isPastPollingDeadline = Date.now() >= pollingEndTimestampRef.current

      if (isFatalError(error) || isAtMaxRetries || isPastPollingDeadline) {
        hasStoppedPollingRef.current = true
        return
      }

      setTimeout(() => {
        void revalidate({ retryCount })
      }, POLL_INTERVAL_MS)
    },
    [],
  )

  const onPollSuccess = useCallback((latestData?: ApiPlaidHostedLinkStatus) => {
    const state = latestData?.state

    if (isTerminal(state)) {
      hasStoppedPollingRef.current = true
    }

    if (state === PlaidHostedLinkState.SUCCEEDED && !hasFiredOnSuccessRef.current) {
      void Promise.resolve(onSuccess()).then(() => {
        hasFiredOnSuccessRef.current = true
      })
    }
  }, [onSuccess])

  const { data, mutate } = usePlaidHostedLinkStatus(
    { refreshInterval: getRefreshInterval, onErrorRetry, onSuccess: onPollSuccess },
    enabled,
  )

  // Clear a previous session's cached status; polling fetches the current one.
  useEffect(() => {
    void mutate(undefined, { revalidate: false })
  }, [mutate])

  return {
    isFailed: data?.state === PlaidHostedLinkState.FAILED,
    isProcessing: data?.state === PlaidHostedLinkState.PROCESSING,
  }
}

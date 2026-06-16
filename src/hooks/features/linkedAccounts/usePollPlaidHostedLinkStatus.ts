import { useCallback, useRef } from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { type ApiPlaidHostedLinkStatus, PlaidHostedLinkState } from '@schemas/linkedAccounts/plaid'
import { usePlaidHostedLinkStatus } from '@hooks/api/businesses/[business-id]/plaid/hosted-link'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_DURATION_MS = 2 * 60 * 1000

const TERMINAL_STATES: ReadonlySet<PlaidHostedLinkState> = new Set([
  PlaidHostedLinkState.SUCCEEDED,
  PlaidHostedLinkState.EXITED,
  PlaidHostedLinkState.FAILED,
  PlaidHostedLinkState.UNKNOWN,
])

const isTerminal = (state: PlaidHostedLinkState | undefined) =>
  state !== undefined && TERMINAL_STATES.has(state)

type UsePollPlaidHostedLinkStatusOptions = {
  onSuccess: () => Awaitable<void>
  enabled: boolean
}

export function usePollPlaidHostedLinkStatus({ onSuccess, enabled }: UsePollPlaidHostedLinkStatusOptions) {
  const hasStoppedPollingRef = useRef(false)
  const pollingDeadlineRef = useRef<number | null>(null)
  const hasFiredOnSuccessRef = useRef(false)

  const getRefreshInterval = useCallback((latestData?: ApiPlaidHostedLinkStatus) => {
    if (pollingDeadlineRef.current === null) {
      pollingDeadlineRef.current = Date.now() + MAX_POLL_DURATION_MS
    }

    if (hasStoppedPollingRef.current) {
      return 0
    }

    if (isTerminal(latestData?.state) || Date.now() >= pollingDeadlineRef.current) {
      hasStoppedPollingRef.current = true
      return 0
    }

    return POLL_INTERVAL_MS
  }, [])

  const onPollSuccess = useCallback((latestData?: ApiPlaidHostedLinkStatus) => {
    if (latestData?.state === PlaidHostedLinkState.SUCCEEDED && !hasFiredOnSuccessRef.current) {
      hasFiredOnSuccessRef.current = true
      void onSuccess()
    }
  }, [onSuccess])

  const { data } = usePlaidHostedLinkStatus(
    { refreshInterval: getRefreshInterval, onSuccess: onPollSuccess },
    enabled,
  )

  return {
    isFailed: data?.state === PlaidHostedLinkState.FAILED,
  }
}

import { useCallback, useEffect } from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { type ApiPlaidHostedLinkStatus, PlaidHostedLinkState } from '@schemas/linkedAccounts/plaid'
import { APIError } from '@utils/api/apiError'
import { usePlaidHostedLinkStatus } from '@hooks/api/businesses/[business-id]/plaid/hosted-link'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'

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
  const shouldContinue = useCallback(
    (latestData?: ApiPlaidHostedLinkStatus) => !isTerminal(latestData?.state),
    [],
  )

  const shouldComplete = useCallback(
    (latestData: ApiPlaidHostedLinkStatus) => latestData.state === PlaidHostedLinkState.SUCCEEDED,
    [],
  )

  const pollingConfig = usePollingConfig<ApiPlaidHostedLinkStatus>({
    shouldContinue,
    shouldComplete,
    onComplete: onSuccess,
    isFatalError,
  })

  const { data, mutate } = usePlaidHostedLinkStatus(pollingConfig, enabled)

  // Clear a previous session's cached status; polling fetches the current one.
  useEffect(() => {
    void mutate(undefined, { revalidate: false })
  }, [mutate])

  return {
    isFailed: data?.state === PlaidHostedLinkState.FAILED,
  }
}

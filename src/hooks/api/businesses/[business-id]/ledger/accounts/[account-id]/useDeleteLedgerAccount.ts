import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerBalancesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const deleteAccountFromLedger = del<
  Record<string, never>,
  { accountId: string, businessId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#delete-account-from-ledger'],
    } as const
  }
}

export function useDeleteAccountFromLedger() {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { accountId } }: { arg: { accountId: string } },
    ) => deleteAccountFromLedger(
      apiUrl,
      accessToken,
      {
        params: { businessId, accountId },
      },
    ),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const { invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void invalidateLedgerBalances()
      void forceReloadLedgerEntries()

      return triggerResult
    },
    [originalTrigger, invalidateLedgerBalances, forceReloadLedgerEntries],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}

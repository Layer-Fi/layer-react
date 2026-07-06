import { useCallback } from 'react'

import { del } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerBalancesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const deleteAccountFromLedger = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

const useDeleteAccountFromLedgerMutation = createMutationHook({
  tags: ['#delete-account-from-ledger'],
  request: deleteAccountFromLedger,
  argToParams: (arg: { accountId: string }) => arg,
  argToBody: () => undefined,
  swrOptions: { throwOnError: true },
})

export function useDeleteAccountFromLedger() {
  const mutationResponse = useDeleteAccountFromLedgerMutation()

  const { invalidate: invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

  const originalTrigger = mutationResponse.trigger

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

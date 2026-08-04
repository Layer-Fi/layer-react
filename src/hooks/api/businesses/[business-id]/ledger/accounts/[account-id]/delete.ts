import { del } from '@utils/shared/api/authenticatedHttp'
import { useLedgerBalancesCacheActions } from '@api/businesses/[business-id]/ledger/balances/get'
import { useLedgerEntriesCacheActions } from '@api/businesses/[business-id]/ledger/entries/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const deleteAccountFromLedger = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

export const useDeleteLedgerAccount = createMutationHook({
  tags: ['#delete-account-from-ledger'],
  request: deleteAccountFromLedger,
  argToParams: (arg: { accountId: string }) => arg,
  argToBody: () => undefined,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateLedgerBalances } = useLedgerBalancesCacheActions()
    const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

    return () => {
      void invalidateLedgerBalances()
      void forceReloadLedgerEntries()
    }
  },
})

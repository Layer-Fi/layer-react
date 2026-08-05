import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { SingleChartAccountSchema } from '@schemas/generalLedger/chartOfAccounts'
import { type UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
import { post } from '@utils/shared/api/authenticatedHttp'
import { useLedgerBalancesCacheActions } from '@api/businesses/[business-id]/ledger/balances/get'
import { useLedgerEntriesCacheActions } from '@api/businesses/[business-id]/ledger/entries/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UPSERT_LEDGER_ACCOUNT_TAG_KEY = '#upsert-ledger-account'

export type UpsertLedgerAccountBody = typeof UpsertLedgerAccountSchema.Encoded

export const UpsertLedgerAccountReturnSchema = UnwrappedDataResponseSchema(SingleChartAccountSchema)

export type UpsertLedgerAccountReturnEncoded = typeof UpsertLedgerAccountReturnSchema.Encoded

export const useLedgerAccountTriggerSuccess = () => {
  const { invalidate: invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

  return () => {
    void invalidateLedgerBalances()
    void forceReloadLedgerEntries()
  }
}

const createLedgerAccount = post<UpsertLedgerAccountReturnEncoded, UpsertLedgerAccountBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const usePostLedgerAccount = createMutationHook({
  tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
  request: createLedgerAccount,
  schema: UpsertLedgerAccountReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useLedgerAccountTriggerSuccess,
})

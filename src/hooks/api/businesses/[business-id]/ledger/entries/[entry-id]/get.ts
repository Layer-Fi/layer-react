import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type LedgerEntry, LedgerEntrySchema } from '@schemas/features/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const LEDGER_ACCOUNTS_ENTRY_TAG_KEY = '#ledger-accounts-entry'

const LedgerAccountsEntryResponseSchema = UnwrappedDataResponseSchema(LedgerEntrySchema)

type GetLedgerAccountsEntryParams = {
  businessId: string
  entryId?: string
}

const getLedgerAccountsEntry = getWithQuery<
  typeof LedgerAccountsEntryResponseSchema.Encoded,
  GetLedgerAccountsEntryParams
>(
  ['businessId', 'entryId'],
  ({ businessId, entryId }) => `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

export const useGetLedgerAccountsEntry = createQueryHook({
  tags: [LEDGER_ACCOUNTS_ENTRY_TAG_KEY],
  request: getLedgerAccountsEntry,
  schema: LedgerAccountsEntryResponseSchema,
})

export const useLedgerAccountsEntryCacheActions = createResourceGlobalCacheActions<LedgerEntry>(LEDGER_ACCOUNTS_ENTRY_TAG_KEY)

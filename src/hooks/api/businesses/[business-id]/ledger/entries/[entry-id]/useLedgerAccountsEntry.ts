import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

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

export const useLedgerAccountsEntry = createQueryHook({
  tags: [LEDGER_ACCOUNTS_ENTRY_TAG_KEY],
  request: getLedgerAccountsEntry,
  schema: LedgerAccountsEntryResponseSchema,
})

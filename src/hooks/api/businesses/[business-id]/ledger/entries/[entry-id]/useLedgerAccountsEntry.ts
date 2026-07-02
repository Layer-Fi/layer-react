import { Schema } from 'effect'

import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const LEDGER_ACCOUNTS_ENTRY_TAG_KEY = '#ledger-accounts-entry'

const LedgerAccountsEntryResponseSchema = Schema.Struct({ data: LedgerEntrySchema })

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

const useLedgerAccountsEntryQuery = createQueryHook({
  tags: [LEDGER_ACCOUNTS_ENTRY_TAG_KEY],
  request: getLedgerAccountsEntry,
  schema: LedgerAccountsEntryResponseSchema,
})

export function useLedgerAccountsEntry({ entryId }: { entryId?: string }) {
  return useLedgerAccountsEntryQuery({
    entryId,
    isEnabled: Boolean(entryId),
  })
}

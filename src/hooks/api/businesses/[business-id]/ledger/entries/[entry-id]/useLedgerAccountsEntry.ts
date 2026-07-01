import { Schema } from 'effect'
import useSWR from 'swr'

import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const LEDGER_ACCOUNTS_ENTRY_TAG_KEY = '#ledger-accounts-entry'

const LedgerAccountsEntryResponseSchema = Schema.Struct({ data: LedgerEntrySchema })

const getLedgerAccountsEntry = get<typeof LedgerAccountsEntryResponseSchema.Encoded>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

const buildKey = createBuildKey<{ businessId: string, entryId?: string }>([LEDGER_ACCOUNTS_ENTRY_TAG_KEY])

export function useLedgerAccountsEntry({ entryId }: { entryId?: string }) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(() =>
    withLocale(buildKey({
      ...auth,
      businessId,
      entryId,
      isEnabled: Boolean(entryId),
    })),
  ({ accessToken, apiUrl, businessId, entryId }) =>
    getLedgerAccountsEntry(apiUrl, accessToken, {
      params: { businessId, entryId },
    })().then(Schema.decodeUnknownPromise(LedgerAccountsEntryResponseSchema)),
  )

  return new SWRQueryResult(swrResponse)
}

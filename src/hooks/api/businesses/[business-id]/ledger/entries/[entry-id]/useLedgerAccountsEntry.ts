import { Schema } from 'effect'
import useSWR from 'swr'

import { LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LEDGER_ACCOUNTS_ENTRY_TAG_KEY = '#ledger-accounts-entry'

const LedgerAccountsEntryResponseSchema = Schema.Struct({ data: LedgerEntrySchema })

const getLedgerAccountsEntry = get<typeof LedgerAccountsEntryResponseSchema.Encoded>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

const buildKey = createBuildKey<{ businessId: string, entryId?: string }>([LEDGER_ACCOUNTS_ENTRY_TAG_KEY])

export function useLedgerAccountsEntry({ entryId }: { entryId?: string }) {
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(() =>
    withLocale(buildKey({
      ...auth,
      apiUrl,
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

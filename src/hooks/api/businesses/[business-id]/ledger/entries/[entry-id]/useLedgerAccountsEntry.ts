import useSWR from 'swr'

import { type LedgerAccountsEntry } from '@internal-types/ledgerAccounts'
import { get } from '@utils/api/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LEDGER_ACCOUNTS_ENTRY_TAG_KEY = '#ledger-accounts-entry'

const getLedgerAccountsEntry = get<{ data: LedgerAccountsEntry }>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

function buildKey({
  accessToken,
  apiUrl,
  businessId,
  entryId,
}: {
  accessToken?: string
  apiUrl: string
  businessId: string
  entryId?: string
}) {
  if (!accessToken || !entryId) return null

  return {
    accessToken,
    apiUrl,
    businessId,
    entryId,
    tags: [LEDGER_ACCOUNTS_ENTRY_TAG_KEY],
  } as const
}

export function useLedgerAccountsEntry({ entryId }: { entryId?: string }) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(() =>
    buildKey({
      accessToken: auth?.access_token,
      apiUrl,
      businessId,
      entryId,
    }),
  ({ accessToken, apiUrl, businessId, entryId }) =>
    getLedgerAccountsEntry(apiUrl, accessToken, {
      params: { businessId, entryId },
    })(),
  )

  return new SWRQueryResult(swrResponse)
}

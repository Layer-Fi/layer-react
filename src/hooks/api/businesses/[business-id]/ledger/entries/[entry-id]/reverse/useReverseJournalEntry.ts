import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const REVERSE_JOURNAL_ENTRY_TAG_KEY = '#reverse-journal-entry'

const reverseJournalEntry = post<Record<never, never>>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

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
      tags: [REVERSE_JOURNAL_ENTRY_TAG_KEY],
    } as const
  }
}

export const useReverseJournalEntry = () => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidate } = useGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: entryId }: { arg: string },
    ) => reverseJournalEntry(apiUrl, accessToken, {
      params: { businessId, entryId },
    }),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const result = await originalTrigger(...triggerParameters)

      void forceReloadLedgerEntries()
      void debouncedInvalidateProfitAndLoss()

      void invalidate(({ tags }) => tags.includes('#balance-sheet'))
      void invalidate(({ tags }) => tags.includes('#statement-of-cash-flow'))

      return result
    },
    [originalTrigger, forceReloadLedgerEntries, debouncedInvalidateProfitAndLoss, invalidate],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}

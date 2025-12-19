import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useLedgerEntriesCacheActions, useLedgerEntriesOptimisticUpdater } from '@features/ledger/entries/api/useListLedgerEntries'

const REMOVE_TAG_FROM_LEDGER_ENTRY_TAG_KEY = '#remove-tag-from-ledger-entry'

type RemoveTagFromLedgerEntryBody = {
  tag_ids: ReadonlyArray<string>
  entity_type: 'LEDGER_ENTRY'
}

const removeTagFromLedgerEntry = post<
  Record<string, never>,
  RemoveTagFromLedgerEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/delete`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  ledgerEntryId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  ledgerEntryId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      ledgerEntryId,
      tags: [REMOVE_TAG_FROM_LEDGER_ENTRY_TAG_KEY],
    } as const
  }
}

type RemoveTagFromLedgerEntryArg = {
  tagId: string
}

type RemoveTagFromLedgerEntryOptions = {
  ledgerEntryId: string
}

export function useRemoveTagFromLedgerEntry({ ledgerEntryId }: RemoveTagFromLedgerEntryOptions) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      ledgerEntryId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { tagId } }: { arg: RemoveTagFromLedgerEntryArg },
    ) => removeTagFromLedgerEntry(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: {
          tag_ids: [tagId],
          entity_type: 'LEDGER_ENTRY',
        },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { debouncedInvalidateLedgerEntries } = useLedgerEntriesCacheActions()
  const { optimisticallyUpdateLedgerEntries } = useLedgerEntriesOptimisticUpdater()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      void optimisticallyUpdateLedgerEntries((ledgerEntry) => {
        if (ledgerEntry.id === ledgerEntryId) {
          const { tagId } = triggerParameters[0]

          return {
            ...ledgerEntry,
            transaction_tags: ledgerEntry.transaction_tags.filter(
              ({ id }) => id !== tagId,
            ),
          }
        }

        return ledgerEntry
      })

      return triggerResultPromise
        .finally(() => { void debouncedInvalidateLedgerEntries() })
        .finally(() => { void debouncedInvalidateProfitAndLoss() })
    },
    [
      ledgerEntryId,
      originalTrigger,
      optimisticallyUpdateLedgerEntries,
      debouncedInvalidateLedgerEntries,
      debouncedInvalidateProfitAndLoss,
    ],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}

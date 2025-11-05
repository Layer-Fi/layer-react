import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../../hooks/useAuth'
import { useLayerContext } from '../../../../../../contexts/LayerContext/LayerContext'
import { useCallback } from 'react'
import { post } from '../../../../../../api/layer/authenticated_http'
import { useLedgerEntriesCacheActions, useLedgerEntriesOptimisticUpdater } from '../../../api/useListLedgerEntries'
import { v4 as uuidv4 } from 'uuid'
import { usePnlDetailLinesInvalidator } from '../../../../../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'

const TAG_LEDGER_ENTRY_TAG_KEY = '#tag-ledger-entry'

type TagLedgerEntryBody = {
  key_values: ReadonlyArray<{
    key: string
    dimension_display_name?: string | null
    value: string
    value_display_name?: string | null
  }>
  entity_ids: ReadonlyArray<string>
  entity_type: 'LEDGER_ENTRY'
}

const tagLedgerEntry = post<
  Record<string, never>,
  TagLedgerEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags`)

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
      tags: [TAG_LEDGER_ENTRY_TAG_KEY],
    } as const
  }
}

type TagLedgerEntryArg = {
  key: string
  dimensionDisplayName?: string | null
  value: string
  valueDisplayName?: string | null
}

type TagLedgerEntryOptions = {
  ledgerEntryId: string
}

export function useTagLedgerEntry({ ledgerEntryId }: TagLedgerEntryOptions) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      ledgerEntryId,
    }),
    (
      { accessToken, apiUrl, businessId, ledgerEntryId },
      { arg: { key, value, dimensionDisplayName, valueDisplayName } }: { arg: TagLedgerEntryArg },
    ) => tagLedgerEntry(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: {
          key_values: [{ key, dimension_display_name: dimensionDisplayName, value, value_display_name: valueDisplayName }],
          entity_ids: [ledgerEntryId],
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
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      void optimisticallyUpdateLedgerEntries((ledgerEntry) => {
        if (ledgerEntry.id === ledgerEntryId) {
          const { key, dimensionDisplayName, value, valueDisplayName } = triggerParameters[0]

          const optimisticTagId = uuidv4()

          const now = new Date()
          const nowISOString = now.toISOString()

          return {
            ...ledgerEntry,
            transaction_tags: [
              ...ledgerEntry.transaction_tags,
              {
                id: optimisticTagId,
                key,
                value,
                created_at: nowISOString,
                updated_at: nowISOString,
                dimension_display_name: dimensionDisplayName,
                value_display_name: valueDisplayName,
                archived_at: null,
                deleted_at: null,
                _local: {
                  isOptimistic: true,
                },
              },
            ],
          }
        }

        return ledgerEntry
      })

      return triggerResultPromise
        .finally(() => {
          void debouncedInvalidateLedgerEntries()
          void invalidatePnlDetailLines()
        })
    },
    [
      ledgerEntryId,
      originalTrigger,
      optimisticallyUpdateLedgerEntries,
      debouncedInvalidateLedgerEntries,
      invalidatePnlDetailLines,
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

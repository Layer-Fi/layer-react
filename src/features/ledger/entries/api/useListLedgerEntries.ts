import useSWR from 'swr'
import { useLayerContext } from '../../../../contexts/LayerContext'
import { useAuth } from '../../../../hooks/useAuth'
import { useEnvironment } from '../../../../providers/Environment/EnvironmentInputProvider'
import { get } from '../../../../api/layer/authenticated_http'
import type { JournalEntry } from '../../../../types'
import { useGlobalInvalidator, useGlobalOptimisticUpdater } from '../../../../utils/swr/useGlobalInvalidator'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'

export const LIST_LEDGER_ENTRIES_TAG_KEY = '#list-ledger-entries'

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
      tags: [LIST_LEDGER_ENTRIES_TAG_KEY],
    } as const
  }
}

type ListLedgerEntriesReturn = {
  data: ReadonlyArray<JournalEntry>
}

export const listLedgerEntries = get<
  ListLedgerEntriesReturn,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/entries`)

export function useListLedgerEntries() {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWR(
    () =>
      buildKey({
        ...auth,
        apiUrl,
        businessId,
      }),
    ({ accessToken, apiUrl, businessId }) => listLedgerEntries(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )()
      .then(({ data }) => data),
  )
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function useLedgerEntriesInvalidator() {
  const { invalidate } = useGlobalInvalidator()

  const invalidateLedgerEntries = useCallback(
    () => invalidate(tags => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidateLedgerEntries = useMemo(
    () => debounce(
      invalidateLedgerEntries,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateLedgerEntries],
  )

  return {
    invalidateLedgerEntries,
    debouncedInvalidateLedgerEntries,
  }
}

export function useLedgerEntriesOptimisticUpdater() {
  const { optimisticUpdate } = useGlobalOptimisticUpdater()

  const optimisticallyUpdateLedgerEntries = useCallback(
    (
      transformJournalEntry: (entry: JournalEntry) => JournalEntry,
    ) =>
      optimisticUpdate<ListLedgerEntriesReturn>(
        tags => tags.includes(LIST_LEDGER_ENTRIES_TAG_KEY),
        (currentData) => {
          return {
            ...currentData,
            data: currentData.data.map(entry => transformJournalEntry(entry)),
          }
        },
      ),
    [optimisticUpdate],
  )

  return { optimisticallyUpdateLedgerEntries }
}

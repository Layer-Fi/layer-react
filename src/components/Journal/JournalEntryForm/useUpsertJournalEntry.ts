import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { post } from '../../../api/layer/authenticated_http'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { UpsertJournalEntrySchema, JournalEntryReturnSchema, type JournalEntryReturn } from './journalEntryFormSchemas'
import { Schema } from 'effect'
import { useLedgerEntriesCacheActions } from '../../../features/ledger/entries/api/useListLedgerEntries'
import { usePnlDetailLinesInvalidator } from '../../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossReportCacheActions } from '../../../hooks/useProfitAndLoss/useProfitAndLossReport'
import { useProfitAndLossSummariesCacheActions } from '../../../hooks/useProfitAndLoss/useProfitAndLossSummaries'
import { useGlobalCacheActions } from '../../../utils/swr/useGlobalCacheActions'
import { DataModel } from '../../../types/general'

const UPSERT_JOURNAL_ENTRY_TAG_KEY = '#upsert-journal-entry'

export enum UpsertJournalEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertJournalEntryBody = typeof UpsertJournalEntrySchema.Encoded

type UpsertJournalEntryReturn = JournalEntryReturn

const createJournalEntry = post<
  UpsertJournalEntryReturn,
  UpsertJournalEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/journal-entries`)

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
      tags: [UPSERT_JOURNAL_ENTRY_TAG_KEY],
    } as const
  }
}

type UseUpsertJournalEntryProps =
  | { mode: UpsertJournalEntryMode.Create }
  | { mode: UpsertJournalEntryMode.Update, journalEntryId: string }

export const useUpsertJournalEntry = (props: UseUpsertJournalEntryProps) => {
  const { data } = useAuth()
  const { businessId, touch } = useLayerContext()

  const { mode } = props
  // For now, we only support create mode since the API doesn't have an update endpoint
  if (mode === UpsertJournalEntryMode.Update) {
    throw new Error('Update mode is not yet supported for journal entries')
  }

  // Cache invalidation hooks
  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const { debouncedInvalidatePnlDetailLines } = usePnlDetailLinesInvalidator()
  const { debouncedInvalidateProfitAndLossReport } = useProfitAndLossReportCacheActions()
  const { debouncedInvalidateProfitAndLossSummaries } = useProfitAndLossSummariesCacheActions()
  const { invalidate } = useGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: UpsertJournalEntryBody },
    ) => {
      return createJournalEntry(apiUrl, accessToken, {
        params: { businessId },
        body,
      }).then(Schema.decodeUnknownPromise(JournalEntryReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const trigger = useCallback(
    async (body: UpsertJournalEntryBody) => {
      const result = await rawMutationResponse.trigger(body)

      // Invalidate all relevant caches after successful journal entry creation
      void forceReloadLedgerEntries()
      void debouncedInvalidatePnlDetailLines()
      void debouncedInvalidateProfitAndLossReport()
      void debouncedInvalidateProfitAndLossSummaries()

      // Invalidate balance sheet and cash flow statement caches
      void invalidate(tags => tags.includes('#balance-sheet'))
      void invalidate(tags => tags.includes('#statement-of-cash-flow'))

      // Touch data models to trigger sync
      touch(DataModel.PROFIT_AND_LOSS)
      touch(DataModel.BALANCE_SHEET)
      touch(DataModel.STATEMENT_OF_CASH_FLOWS)

      return result
    },
    [rawMutationResponse.trigger, forceReloadLedgerEntries, debouncedInvalidatePnlDetailLines,
      debouncedInvalidateProfitAndLossReport, debouncedInvalidateProfitAndLossSummaries,
      invalidate, touch],
  )

  return {
    trigger,
    data: rawMutationResponse.data,
    error: rawMutationResponse.error,
    isMutating: rawMutationResponse.isMutating,
  }
}

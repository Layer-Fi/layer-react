import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useBalanceSheetGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useStatementOfCashFlowGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type JournalEntryReturn, JournalEntryReturnSchema, type UpsertJournalEntrySchema } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'

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

const buildKey = createBuildKey<{ businessId: string }>([UPSERT_JOURNAL_ENTRY_TAG_KEY])

type UseUpsertJournalEntryProps =
  | { mode: UpsertJournalEntryMode.Create }
  | { mode: UpsertJournalEntryMode.Update, journalEntryId: string }

export const useUpsertJournalEntry = (props: UseUpsertJournalEntryProps) => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  // For now, we only support create mode since the API doesn't have an update endpoint
  if (mode === UpsertJournalEntryMode.Update) {
    throw new Error('Update mode is not yet supported for journal entries')
  }

  // Cache invalidation hooks
  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidate: invalidateBalanceSheet } = useBalanceSheetGlobalCacheActions()
  const { invalidate: invalidateStatementOfCashFlow } = useStatementOfCashFlowGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
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
      void debouncedInvalidateProfitAndLoss()

      // Invalidate balance sheet and cash flow statement caches
      void invalidateBalanceSheet()
      void invalidateStatementOfCashFlow()

      return result
    },
    [rawMutationResponse, forceReloadLedgerEntries, debouncedInvalidateProfitAndLoss, invalidateBalanceSheet, invalidateStatementOfCashFlow],
  )

  return {
    trigger,
    data: rawMutationResponse.data,
    isError: !!rawMutationResponse.error,
    isMutating: rawMutationResponse.isMutating,
  }
}

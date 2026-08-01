import { post } from '@utils/api/authenticatedHttp'
import { useLedgerEntriesCacheActions } from '@api/businesses/[business-id]/ledger/entries/get'
import { useBalanceSheetGlobalCacheActions } from '@api/businesses/[business-id]/reports/balance-sheet/get'
import { useStatementOfCashFlowGlobalCacheActions } from '@api/businesses/[business-id]/reports/cashflow-statement/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { JournalEntryReturnSchema, type UpsertJournalEntrySchema } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'

const UPSERT_JOURNAL_ENTRY_TAG_KEY = '#upsert-journal-entry'

export enum UpsertJournalEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertJournalEntryBody = typeof UpsertJournalEntrySchema.Encoded

const createJournalEntry = post<
  typeof JournalEntryReturnSchema.Encoded,
  UpsertJournalEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/journal-entries`)

const useCreateJournalEntry = createMutationHook({
  tags: [UPSERT_JOURNAL_ENTRY_TAG_KEY],
  request: createJournalEntry,
  schema: JournalEntryReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
    const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
    const { invalidate: invalidateBalanceSheet } = useBalanceSheetGlobalCacheActions()
    const { invalidate: invalidateStatementOfCashFlow } = useStatementOfCashFlowGlobalCacheActions()

    return () => {
      // Invalidate all relevant caches after successful journal entry creation
      void forceReloadLedgerEntries()
      void debouncedInvalidateProfitAndLoss()

      // Invalidate balance sheet and cash flow statement caches
      void invalidateBalanceSheet()
      void invalidateStatementOfCashFlow()
    }
  },
})

type UseUpsertJournalEntryProps =
  | { mode: UpsertJournalEntryMode.Create }
  | { mode: UpsertJournalEntryMode.Update, journalEntryId: string }

export const usePostJournalEntry = (props: UseUpsertJournalEntryProps) => {
  const { mode } = props
  // For now, we only support create mode since the API doesn't have an update endpoint
  if (mode === UpsertJournalEntryMode.Update) {
    throw new Error('Update mode is not yet supported for journal entries')
  }

  return useCreateJournalEntry()
}

import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useLedgerAccountLinesCacheActions } from '@api/businesses/[business-id]/ledger/accounts/[account-id]/lines/get'
import { useLedgerEntriesCacheActions } from '@api/businesses/[business-id]/ledger/entries/get'
import { useBalanceSheetGlobalCacheActions } from '@api/businesses/[business-id]/reports/balance-sheet/get'
import { useStatementOfCashFlowGlobalCacheActions } from '@api/businesses/[business-id]/reports/cashflow-statement/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'

const REVERSE_JOURNAL_ENTRY_TAG_KEY = '#reverse-journal-entry'

const reverseJournalEntry = post<
  Record<never, never>,
  Record<string, never>,
  { businessId: string, entryId: string }
>(({ businessId, entryId }) => `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`)

export const usePostReverseJournalEntry = createMutationHook({
  tags: [REVERSE_JOURNAL_ENTRY_TAG_KEY],
  request: reverseJournalEntry,
  argToParams: (entryId: string) => ({ entryId }),
  argToBody: () => undefined,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
    const { forceReload: forceReloadLedgerAccountLines } = useLedgerAccountLinesCacheActions()
    const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
    const { invalidate: invalidateBalanceSheet } = useBalanceSheetGlobalCacheActions()
    const { invalidate: invalidateStatementOfCashFlow } = useStatementOfCashFlowGlobalCacheActions()

    return () => {
      void forceReloadLedgerEntries()
      void forceReloadLedgerAccountLines()
      void debouncedInvalidateProfitAndLoss()

      void invalidateBalanceSheet()
      void invalidateStatementOfCashFlow()
    }
  },
})

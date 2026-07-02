import { useCallback } from 'react'

import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useBalanceSheetGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useStatementOfCashFlowGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REVERSE_JOURNAL_ENTRY_TAG_KEY = '#reverse-journal-entry'

const reverseJournalEntry = post<
  Record<never, never>,
  Record<string, never>,
  { businessId: string, entryId: string }
>(({ businessId, entryId }) => `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`)

const useReverseJournalEntryMutation = createMutationHook({
  tags: [REVERSE_JOURNAL_ENTRY_TAG_KEY],
  request: reverseJournalEntry,
  argToParams: (entryId: string) => ({ entryId }),
  argToBody: () => undefined,
  swrOptions: { throwOnError: true },
})

export const useReverseJournalEntry = () => {
  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidate: invalidateBalanceSheet } = useBalanceSheetGlobalCacheActions()
  const { invalidate: invalidateStatementOfCashFlow } = useStatementOfCashFlowGlobalCacheActions()

  const mutationResponse = useReverseJournalEntryMutation()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const result = await originalTrigger(...triggerParameters)

      void forceReloadLedgerEntries()
      void debouncedInvalidateProfitAndLoss()

      void invalidateBalanceSheet()
      void invalidateStatementOfCashFlow()

      return result
    },
    [originalTrigger, forceReloadLedgerEntries, debouncedInvalidateProfitAndLoss, invalidateBalanceSheet, invalidateStatementOfCashFlow],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}

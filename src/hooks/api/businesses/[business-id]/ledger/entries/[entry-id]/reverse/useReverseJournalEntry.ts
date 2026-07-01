import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useBalanceSheetGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useStatementOfCashFlowGlobalCacheActions } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const REVERSE_JOURNAL_ENTRY_TAG_KEY = '#reverse-journal-entry'

const reverseJournalEntry = post<Record<never, never>>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

const buildKey = createBuildKey<{ businessId: string }>([REVERSE_JOURNAL_ENTRY_TAG_KEY])

export const useReverseJournalEntry = () => {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidate: invalidateBalanceSheet } = useBalanceSheetGlobalCacheActions()
  const { invalidate: invalidateStatementOfCashFlow } = useStatementOfCashFlowGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
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

      void invalidateBalanceSheet()
      void invalidateStatementOfCashFlow()

      return result
    },
    [originalTrigger, forceReloadLedgerEntries, debouncedInvalidateProfitAndLoss, invalidateBalanceSheet, invalidateStatementOfCashFlow],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}

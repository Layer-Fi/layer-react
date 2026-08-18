import { useCallback } from 'react'

import { EntryType } from '@schemas/features/generalLedger/ledgerEntry'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGetLedgerAccountsEntry } from '@api/businesses/[business-id]/ledger/entries/[entry-id]/get'
import { usePostReverseJournalEntry } from '@api/businesses/[business-id]/ledger/entries/[entry-id]/reverse/post'
import {
  useChartOfAccountsSelectionActions,
  useSelectedLedgerEntryId,
} from '@providers/features/generalLedger/ChartOfAccountsSelectionStore/ChartOfAccountsSelectionStoreProvider'
import { LedgerEntryDetails } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetails'
import { type LedgerEntryDetailStringOverrides } from '@features/generalLedger/types'

const legacyClassNames = createLegacyClassNames({
  'details:root': 'Layer__ledger-account__entry-details',
  'details:header': 'Layer__ledger-account__entry-details__header',
  'details:lineItems': 'Layer__ledger-account__entry-details__line-items',
  'details:lineItemsTable': 'Layer__ledger-account__entry-details__table',
})

export { LedgerEntrySourceDetailView } from '@blocks/LedgerEntry/LedgerEntrySourceDetailView/LedgerEntrySourceDetailView'

export type LedgerAccountEntryDetailsStringOverrides = LedgerEntryDetailStringOverrides

export const LedgerAccountEntryDetails = ({
  stringOverrides,
}: {
  stringOverrides?: LedgerAccountEntryDetailsStringOverrides
}) => {
  const selectedEntryId = useSelectedLedgerEntryId()
  const { closeSelectedEntry } = useChartOfAccountsSelectionActions()

  const {
    data: entryData,
    isLoading: isLoadingEntry,
    isError: isErrorEntry,
  } = useGetLedgerAccountsEntry({ entryId: selectedEntryId, isEnabled: Boolean(selectedEntryId) })

  const { trigger: reverseEntry } = usePostReverseJournalEntry()

  const handleReverse = useCallback(async () => {
    if (!entryData) return
    await reverseEntry(entryData.id)
  }, [entryData, reverseEntry])

  return (
    <LedgerEntryDetails
      entry={entryData}
      isLoading={isLoadingEntry}
      isError={isErrorEntry}
      onClose={closeSelectedEntry}
      onReverse={entryData?.entryType === EntryType.Manual ? handleReverse : undefined}
      stringOverrides={stringOverrides}
      legacyClassNames={{
        root: legacyClassNames('details:root'),
        header: legacyClassNames('details:header'),
        lineItems: legacyClassNames('details:lineItems'),
        lineItemsTable: legacyClassNames('details:lineItemsTable'),
      }}
    />
  )
}

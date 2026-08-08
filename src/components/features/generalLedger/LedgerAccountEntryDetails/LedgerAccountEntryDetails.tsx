import { useCallback, useContext } from 'react'

import { EntryType } from '@schemas/features/generalLedger/ledgerEntry'
import { usePostReverseJournalEntry } from '@api/businesses/[business-id]/ledger/entries/[entry-id]/reverse/post'
import { LedgerAccountsContext } from '@providers/features/generalLedger/LedgerAccountsContext/LedgerAccountsContext'
import { LedgerEntryDetails } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetails'
import { type LedgerEntryDetailStringOverrides } from '@features/generalLedger/types'

export { LedgerEntrySourceDetailView } from '@blocks/LedgerEntry/LedgerEntrySourceDetailView/LedgerEntrySourceDetailView'

export type LedgerAccountEntryDetailsStringOverrides = LedgerEntryDetailStringOverrides

export const LedgerAccountEntryDetails = ({
  stringOverrides,
}: {
  stringOverrides?: LedgerAccountEntryDetailsStringOverrides
}) => {
  const { entryData, isLoadingEntry, closeSelectedEntry, isErrorEntry, refetch } =
    useContext(LedgerAccountsContext)

  const { trigger: reverseEntry } = usePostReverseJournalEntry()

  const handleReverse = useCallback(async () => {
    if (!entryData) return
    await reverseEntry(entryData.id)
    void refetch()
  }, [entryData, reverseEntry, refetch])

  return (
    <LedgerEntryDetails
      entry={entryData}
      isLoading={isLoadingEntry}
      isError={isErrorEntry}
      onClose={closeSelectedEntry}
      onReverse={entryData?.entryType === EntryType.Manual ? handleReverse : undefined}
      stringOverrides={stringOverrides}
    />
  )
}

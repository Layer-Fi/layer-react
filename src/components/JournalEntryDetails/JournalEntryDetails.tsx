import { useCallback, useContext, useMemo } from 'react'

import { EntryType } from '@schemas/generalLedger/ledgerEntry'
import { useReverseJournalEntry } from '@hooks/api/businesses/[business-id]/ledger/entries/[entry-id]/reverse/useReverseJournalEntry'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { LedgerEntryDetails } from '@components/LedgerEntryDetails/LedgerEntryDetails'

export const JournalEntryDetails = () => {
  const {
    data,
    closeSelectedEntry,
    selectedEntryId,
    refetch,
  } = useContext(JournalContext)

  const { trigger: reverseEntry } = useReverseJournalEntry()

  const entry = useMemo(
    () => (selectedEntryId && data ? data.find(x => x.id === selectedEntryId) : undefined),
    [data, selectedEntryId],
  )

  const handleReverse = useCallback(async () => {
    if (!entry) return
    await reverseEntry(entry.id)
    void refetch()
  }, [entry, reverseEntry, refetch])

  return (
    <LedgerEntryDetails
      entry={entry}
      onClose={closeSelectedEntry}
      onReverse={entry?.entryType === EntryType.Manual ? handleReverse : undefined}
    />
  )
}

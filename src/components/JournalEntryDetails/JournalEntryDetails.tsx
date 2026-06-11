import { useCallback, useContext, useMemo } from 'react'

import { EntryType } from '@schemas/generalLedger/ledgerEntry'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { LedgerEntryDetails } from '@components/LedgerEntryDetails/LedgerEntryDetails'

export const JournalEntryDetails = () => {
  const {
    data,
    closeSelectedEntry,
    selectedEntryId,
    reverseEntry,
    refetch,
  } = useContext(JournalContext)

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

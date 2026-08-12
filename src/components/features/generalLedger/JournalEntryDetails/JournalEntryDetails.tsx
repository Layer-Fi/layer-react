import { useCallback, useContext, useMemo } from 'react'

import { EntryType } from '@schemas/features/generalLedger/ledgerEntry'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { usePostReverseJournalEntry } from '@api/businesses/[business-id]/ledger/entries/[entry-id]/reverse/post'
import { JournalContext } from '@providers/features/generalLedger/JournalContext/JournalContext'
import { LedgerEntryDetails } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetails'

/*
 * The journal generation of the entry-detail names. See the ledger-account map for why these are
 * passed per caller.
 */
const legacyClassNames = createLegacyClassNames({
  'details:root': 'Layer__journal__entry-details',
  'details:lineItems': 'Layer__journal__entry-details__line-items',
})

export const JournalEntryDetails = () => {
  const {
    data,
    closeSelectedEntry,
    selectedEntryId,
    refetch,
  } = useContext(JournalContext)

  const { trigger: reverseEntry } = usePostReverseJournalEntry()

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
      legacyClassNames={{
        root: legacyClassNames('details:root'),
        lineItems: legacyClassNames('details:lineItems'),
      }}
      onReverse={entry?.entryType === EntryType.Manual ? handleReverse : undefined}
    />
  )
}

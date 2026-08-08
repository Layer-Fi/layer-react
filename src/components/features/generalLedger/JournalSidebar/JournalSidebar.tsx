import { useContext } from 'react'

import { JournalContext } from '@providers/features/generalLedger/JournalContext/JournalContext'
import { JournalEntryDetails } from '@features/generalLedger/JournalEntryDetails/JournalEntryDetails'

export const JournalSidebar = () => {
  const { selectedEntryId } = useContext(JournalContext)

  if (selectedEntryId && selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }

  return null
}

import { type RefObject, useContext } from 'react'

import { JournalContext } from '@providers/generalLedger/JournalContext/JournalContext'
import { JournalEntryDetails } from '@features/generalLedger/JournalEntryDetails/JournalEntryDetails'

export const JournalSidebar = ({
  parentRef: _parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { selectedEntryId } = useContext(JournalContext)

  if (selectedEntryId && selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }

  return null
}

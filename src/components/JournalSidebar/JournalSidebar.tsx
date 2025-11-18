import { RefObject, useContext } from 'react'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { JournalEntryDetails } from '@components/JournalEntryDetails/JournalEntryDetails'

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

import { RefObject, useContext } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import { JournalEntryDetails } from '../JournalEntryDetails'

export const JournalSidebar = ({
  parentRef: _parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { selectedEntryId } = useContext(JournalContext)

  // Only render details for existing entries (not 'new')
  // Creation is now handled by the full-page JournalEntryForm
  if (selectedEntryId && selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }

  return null
}

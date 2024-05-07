import React, { RefObject, useContext } from 'react'
import { JournalContext } from '../Journal/Journal'
import { JournalEntryDetails } from '../JournalEntryDetails'
import { JournalForm } from '../JournalForm'

export const JournalSidebar = ({
  parentRef: _parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { selectedEntryId } = useContext(JournalContext)
  if (selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }
  return <JournalForm />
}

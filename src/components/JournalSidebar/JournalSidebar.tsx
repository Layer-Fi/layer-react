import React, { RefObject, useContext } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import { JournalConfig } from '../Journal/Journal'
import { JournalEntryDetails } from '../JournalEntryDetails'
import { JournalForm } from '../JournalForm'

export const JournalSidebar = ({
  parentRef: _parentRef,
  config,
}: {
  parentRef?: RefObject<HTMLDivElement>
  config: JournalConfig
}) => {
  const { selectedEntryId } = useContext(JournalContext)
  if (selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }
  return <JournalForm config={config} />
}

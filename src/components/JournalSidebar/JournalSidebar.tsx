import React, { RefObject, useContext } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import { JournalConfig } from '../Journal/Journal'
import { JournalEntryDetails } from '../JournalEntryDetails'
import { JournalForm } from '../JournalForm'
import { JournalFormStringOverrides } from '../JournalForm/JournalForm'

export const JournalSidebar = ({
  parentRef: _parentRef,
  config,
  stringOverrides,
}: {
  parentRef?: RefObject<HTMLDivElement>
  config: JournalConfig
  stringOverrides?: JournalFormStringOverrides
}) => {
  const { selectedEntryId } = useContext(JournalContext)
  if (selectedEntryId !== 'new') {
    return <JournalEntryDetails />
  }
  return <JournalForm config={config} stringOverrides={stringOverrides}/>
}

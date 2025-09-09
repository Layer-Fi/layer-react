import { RefObject, useContext } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import { JournalConfig } from '../Journal/Journal'
import { JournalEntryDetails } from '../JournalEntryDetails'
import {
  JournalFormStringOverrides,
  // JournalForm,
} from '../JournalForm/JournalForm'
import { CustomJournalEntryForm } from '../CustomJournalEntryForm/CustomJournalEntryForm'

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
  return <CustomJournalEntryForm onSuccess={() => {}} createdBy='You' />
  // return <JournalForm config={config} stringOverrides={stringOverrides} />
}

import { Heading } from '../../ui/Typography/Heading'
import { Button } from '../../ui/Button/Button'
import { useCallback, useMemo, useRef, useState } from 'react'
import { BaseDetailView } from '../../BaseDetailView/BaseDetailView'
import { JournalEntryForm, type JournalEntryFormState } from '../JournalEntryForm/JournalEntryForm'
import { HStack } from '../../ui/Stack/Stack'
import { Save } from 'lucide-react'
import { useJournalNavigation } from '../../../providers/JournalStore/JournalStoreProvider'
import X from '../../../icons/X'
import BackArrow from '../../../icons/BackArrow'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'

export const JournalEntryDrawer = ({ showTags = true, showCustomerVendor = true }: { showTags?: boolean, showCustomerVendor?: boolean }) => {
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false)
  const { toJournalTable } = useJournalNavigation()
  const formRef = useRef<{ submit: () => Promise<void> }>(null)

  const [formState, setFormState] = useState<JournalEntryFormState>({
    isDirty: false,
    isSubmitting: false,
  })

  const onChangeFormState = useCallback((nextState: JournalEntryFormState) => {
    setFormState(nextState)
  }, [])

  const onSubmit = useCallback(() => void formRef.current?.submit(), [])

  const onJournalEntrySuccess = useCallback(() => {
    toJournalTable()
  }, [toJournalTable])

  const Header = useCallback(() => {
    return (
      <JournalEntryDrawerHeader
        onSubmit={onSubmit}
        formState={formState}
      />
    )
  }, [onSubmit, formState])

  const hasChanges = formState.isDirty
  const onGoBack = useCallback(() => {
    if (hasChanges) {
      setIsDiscardChangesModalOpen(true)
    }
    else {
      toJournalTable()
    }
  }, [hasChanges, toJournalTable])

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: hasChanges ? X : BackArrow }}
        name='JournalEntryDrawer'
        onGoBack={onGoBack}
      >
        <JournalEntryForm
          isReadOnly={false}
          showTags={showTags}
          showCustomerVendor={showCustomerVendor}
          onSuccess={onJournalEntrySuccess}
          onChangeFormState={onChangeFormState}
          ref={formRef}
        />
      </BaseDetailView>
      <BaseConfirmationModal
        isOpen={isDiscardChangesModalOpen}
        onOpenChange={setIsDiscardChangesModalOpen}
        title='Discard changes to this journal entry?'
        description='Any unsaved changes will be lost.'
        onConfirm={toJournalTable}
        confirmLabel='Discard changes'
        cancelLabel='Keep editing'
      />
    </>
  )
}

type JournalEntryDrawerHeaderProps = {
  onSubmit: () => void
  formState: JournalEntryFormState
}

const JournalEntryDrawerHeader = ({ onSubmit, formState }: JournalEntryDrawerHeaderProps) => {
  const { toJournalTable } = useJournalNavigation()
  const { isSubmitting } = formState

  const saveButton = useMemo(() => (
    <Button isPending={isSubmitting} onPress={onSubmit}>
      Post
      <Save size={14} />
    </Button>
  ), [isSubmitting, onSubmit])

  const cancelButton = useMemo(() => (
    <Button variant='outlined' onPress={toJournalTable}>
      Cancel
    </Button>
  ), [toJournalTable])

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>Add new entry</Heading>
      <HStack gap='xs'>
        {cancelButton}
        {saveButton}
      </HStack>
    </HStack>
  )
}

import { useCallback, useMemo, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useJournalNavigation } from '@providers/JournalStore/JournalStoreProvider'
import BackArrow from '@icons/BackArrow'
import X from '@icons/X'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { JournalEntryForm, type JournalEntryFormState } from '@components/Journal/JournalEntryForm/JournalEntryForm'

export const JournalEntryDrawer = ({ showTags = true, showCustomerVendor = true }: { showTags?: boolean, showCustomerVendor?: boolean }) => {
  const { t } = useTranslation()
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
        title={t('generalLedger.discardChangesToThisJournalEntry', 'Discard changes to this journal entry?')}
        description={t('common.anyUnsavedChangesWillBeLost', 'Any unsaved changes will be lost.')}
        onConfirm={toJournalTable}
        confirmLabel={t('common.discardChanges', 'Discard changes')}
        cancelLabel={t('common.keepEditing', 'Keep editing')}
      />
    </>
  )
}

type JournalEntryDrawerHeaderProps = {
  onSubmit: () => void
  formState: JournalEntryFormState
}

const JournalEntryDrawerHeader = ({ onSubmit, formState }: JournalEntryDrawerHeaderProps) => {
  const { t } = useTranslation()
  const { toJournalTable } = useJournalNavigation()
  const { isSubmitting } = formState

  const saveButton = useMemo(() => (
    <Button isPending={isSubmitting} onPress={onSubmit}>
      {t('common.post', 'Post')}
      <Save size={14} />
    </Button>
  ), [t, isSubmitting, onSubmit])

  const cancelButton = useMemo(() => (
    <Button variant='outlined' onPress={toJournalTable}>
      {t('common.cancel', 'Cancel')}
    </Button>
  ), [t, toJournalTable])

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>{t('generalLedger.addNewEntry', 'Add new entry')}</Heading>
      <HStack gap='xs'>
        {cancelButton}
        {saveButton}
      </HStack>
    </HStack>
  )
}

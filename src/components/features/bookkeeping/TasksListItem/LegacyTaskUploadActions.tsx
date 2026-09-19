import { useTranslation } from 'react-i18next'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'

type LegacyTaskUploadActionsProps = {
  task: LegacyBusinessTask
  selectedFiles?: File[]
  isDirty: boolean
  isSubmitting: boolean
  isDeletingUploads: boolean
  onSelectFiles: (files: File[]) => void
  onClearFiles: () => void
  onSubmit: () => void
  onDeleteUploads: () => void
}

export const LegacyTaskUploadActions = ({
  task,
  selectedFiles,
  isDirty,
  isSubmitting,
  isDeletingUploads,
  onSelectFiles,
  onClearFiles,
  onSubmit,
  onDeleteUploads,
}: LegacyTaskUploadActionsProps) => {
  const { t } = useTranslation()

  if (task.status === BusinessTaskStatus.Todo) {
    if (!selectedFiles) {
      return (
        <FileInput
          onUpload={onSelectFiles}
          text={t('bookkeeping:TasksListItem.LegacyTaskUploadActions.action.select_files', 'Select files')}
          allowMultipleUploads
        />
      )
    }

    return (
      <>
        <Button variant='outlined' onPress={onClearFiles}>
          {t('common:action.cancel_label', 'Cancel')}
        </Button>
        <Button onPress={onSubmit} isDisabled={isSubmitting}>
          {t('common:action.submit_label', 'Submit')}
        </Button>
      </>
    )
  }

  if (task.status !== BusinessTaskStatus.UserMarkedCompleted) return null

  if (task.userResponse && isDirty) {
    return (
      <Button onPress={onSubmit} isDisabled={isSubmitting}>
        {t('common:action.update_label', 'Update')}
      </Button>
    )
  }

  return (
    <Button variant='outlined' onPress={onDeleteUploads} isDisabled={isDeletingUploads}>
      {t('bookkeeping:TasksListItem.LegacyTaskUploadActions.action.delete_uploads', 'Delete Uploads')}
    </Button>
  )
}

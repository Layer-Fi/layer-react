import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { P } from '@ui/Typography/Text'
import { useLegacyTaskForm } from '@features/bookkeeping/TasksListItem/useLegacyTaskForm'

type LegacyTaskBodyProps = {
  task: UserVisibleTask & LegacyBusinessTask
  onAnswered: () => void
}

export const LegacyTaskBody = ({ task, onAnswered }: LegacyTaskBodyProps) => {
  const { t } = useTranslation()
  const {
    form,
    isUpload,
    selectedFiles,
    setSelectedFiles,
    deleteUploads,
    isDeletingUploads,
  } = useLegacyTaskForm({ task, onAnswered })

  const userResponse = useStore(form.store, state => state.values.userResponse)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)
  const isDirty = useStore(form.store, state => state.isDirty)

  const submit = () => void form.handleSubmit()

  const renderUploadAction = () => {
    if (task.status === BusinessTaskStatus.Todo) {
      if (!selectedFiles) {
        return (
          <FileInput
            onUpload={setSelectedFiles}
            text={t('bookkeeping:TasksListItem.LegacyTaskBody.action.select_files', 'Select files')}
            allowMultipleUploads
          />
        )
      }

      return (
        <>
          <Button variant='outlined' onPress={() => setSelectedFiles(undefined)}>
            {t('common:action.cancel_label', 'Cancel')}
          </Button>
          <Button onPress={submit} isDisabled={isSubmitting}>
            {t('common:action.submit_label', 'Submit')}
          </Button>
        </>
      )
    }

    if (task.status !== BusinessTaskStatus.UserMarkedCompleted) return null

    if (task.userResponse && isDirty) {
      return (
        <Button onPress={submit} isDisabled={isSubmitting}>
          {t('common:action.update_label', 'Update')}
        </Button>
      )
    }

    return (
      <Button variant='outlined' onPress={() => void deleteUploads()} isDisabled={isDeletingUploads}>
        {t('bookkeeping:TasksListItem.LegacyTaskBody.action.delete_uploads', 'Delete Uploads')}
      </Button>
    )
  }

  return (
    <div className='Layer__tasks-list-item__body-info'>
      <P size='sm' variant='inherit'>{task.question}</P>
      <form.AppField name='userResponse'>
        {field => (
          <field.FormTextAreaField
            label={task.question}
            showLabel={false}
            placeholder={isUpload
              ? t('bookkeeping:TasksListItem.LegacyTaskBody.label.optional_description', 'Optional description')
              : ''}
          />
        )}
      </form.AppField>
      {isUpload
        ? (
          <div className='Layer__tasks-list__link-list'>
            {selectedFiles
              ? (
                <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:TasksListItem.LegacyTaskBody.label.selected_files', 'Selected Files:')}</div>
              )
              : task.documents
                ? (
                  <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:TasksListItem.LegacyTaskBody.label.uploaded_files', 'Uploaded Files:')}</div>
                )
                : null}
            <ul className='Layer__tasks-list__links-list'>
              {task.documents?.map((document, idx) => (
                <li key={`uploaded-doc-name-${idx}`}><a className='Layer__tasks-list-item__link' href={document.presignedUrl.presignedUrl}>{document.fileName}</a></li>
              ))}
              {selectedFiles?.map((file, idx) => (
                <li key={`selected-file-name-${idx}`}><a className='Layer__tasks-list-item__link'>{file.name}</a></li>
              ))}
            </ul>
          </div>
        )
        : null}
      <div className='Layer__tasks-list-item__actions'>
        {isUpload
          ? renderUploadAction()
          : (
            <Button isDisabled={isSubmitting || userResponse.length === 0 || !isDirty} onPress={submit}>
              {task.userResponse && isDirty
                ? t('common:action.update_label', 'Update')
                : t('common:action.save_label', 'Save')}
            </Button>
          )}
      </div>
    </div>
  )
}

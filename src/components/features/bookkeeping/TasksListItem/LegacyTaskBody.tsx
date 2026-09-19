import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Button } from '@ui/Button/Button'
import { P } from '@ui/Typography/Text'
import { LegacyTaskFileList } from '@features/bookkeeping/TasksListItem/LegacyTaskFileList'
import { LegacyTaskUploadActions } from '@features/bookkeeping/TasksListItem/LegacyTaskUploadActions'
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
      {isUpload ? <LegacyTaskFileList documents={task.documents} selectedFiles={selectedFiles} /> : null}
      <div className='Layer__tasks-list-item__actions'>
        {isUpload
          ? (
            <LegacyTaskUploadActions
              task={task}
              selectedFiles={selectedFiles}
              isDirty={isDirty}
              isSubmitting={isSubmitting}
              isDeletingUploads={isDeletingUploads}
              onSelectFiles={setSelectedFiles}
              onClearFiles={() => setSelectedFiles(undefined)}
              onSubmit={submit}
              onDeleteUploads={() => void deleteUploads()}
            />
          )
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

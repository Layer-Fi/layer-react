import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { BusinessTaskStatus, TaskUserResponseType } from '@schemas/businessTasks/businessTask'
import { isCompletedTask, type UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { getIconForTask } from '@utils/bookkeeping/tasks/getBookkeepingTaskStatusIcon'
import { useDeleteUploadsOnTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/delete/useDeleteUploadsOnTask'
import { useUpdateTaskUploadDescription } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/update-description/useUpdateTaskUploadDescription'
import { useUploadDocumentsForTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/useUploadDocumentsForTask'
import { useSubmitUserResponseForTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/user-response/useSubmitResponseForTask'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import ChevronDownFill from '@icons/ChevronDownFill'
import { TextArea } from '@ui/Input/TextArea'
import { P } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@components/Button/Button'
import { FileInput } from '@components/Input/FileInput'

type TasksListItemProps = {
  task: UserVisibleTask
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const TasksListItem = forwardRef<HTMLDivElement, TasksListItemProps>((
  { task, defaultOpen, onExpandTask },
  ref,
) => {
  const { t } = useTranslation()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [userResponse, setUserResponse] = useState(task.userResponse ?? '')
  const [selectedFiles, setSelectedFiles] = useState<File[]>()

  const { trigger: handleSubmitUserResponseForTask, isMutating: isSubmittingResponse } = useSubmitUserResponseForTask()
  const { trigger: handleUploadDocumentsForTask, isMutating: isUploadingDocuments } = useUploadDocumentsForTask()
  const { trigger: handleDeleteUploadsOnTask } = useDeleteUploadsOnTask()
  const { trigger: handleUpdateTaskUploadDescription } = useUpdateTaskUploadDescription()

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  const taskHeadClassName = classNames(
    'Layer__tasks-list-item__head-info',
    isCompletedTask(task)
      ? 'Layer__tasks-list-item--completed'
      : 'Layer__tasks-list-item--pending',
  )

  const taskItemClassName = classNames(
    'Layer__tasks-list-item',
    isOpen && 'Layer__tasks-list-item__expanded',
  )

  useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  const submit = async () => {
    if (!selectedFiles) {
      return
    }

    await handleUploadDocumentsForTask({
      taskId: task.id,
      files: selectedFiles,
      description: userResponse,
    })

    setIsOpen(false)
    setSelectedFiles(undefined)
  }

  const onClickTaskItemHead = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TaskClicked,
      version: 1,
      payload: { taskId: task.id },
    })
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [isOpen, onExpandTask, emitLayerEvent, task.id])

  const uploadDocumentAction = useMemo(() => {
    if (task.userResponseType === TaskUserResponseType.UploadDocument) {
      if (task.status === BusinessTaskStatus.Todo) {
        if (!selectedFiles) {
          return (
            <FileInput
              onUpload={(files: File[]) => {
                setSelectedFiles(files)
              }}
              text={t('bookkeeping:action.select_files', 'Select files')}
              allowMultipleUploads
            />
          )
        }
        else {
          return (
            <>
              <Button
                variant={ButtonVariant.secondary}
                onClick={() => setSelectedFiles(undefined)}
              >
                {t('common:action.cancel_label', 'Cancel')}
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => void submit()}
                disabled={isUploadingDocuments}
              >
                {t('common:action.submit_label', 'Submit')}
              </Button>
            </>
          )
        }
      }
      else if (task.status === BusinessTaskStatus.UserMarkedCompleted) {
        if (task.userResponse && task.userResponse != userResponse) {
          return (
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => {
                void handleUpdateTaskUploadDescription({
                  taskId: task.id,
                  description: userResponse,
                })
              }}
            >
              {t('common:action.update_label', 'Update')}
            </Button>
          )
        }
        else {
          return (
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => {
                void handleDeleteUploadsOnTask({
                  taskId: task.id,
                })
              }}
            >
              {t('bookkeeping:action.delete_uploads', 'Delete Uploads')}
            </Button>
          )
        }
      }
      else { return null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, task, selectedFiles, userResponse, isUploadingDocuments])

  return (
    <div className='Layer__tasks-list-item-wrapper' ref={ref}>
      <div className={taskItemClassName}>
        <div
          className='Layer__tasks-list-item__head'
          onClick={onClickTaskItemHead}
        >
          <div className={taskHeadClassName}>
            <div className='Layer__tasks-list-item__head-info__status'>
              {getIconForTask(task)}
            </div>
            <P variant='inherit'>{task.title}</P>
          </div>
          <ChevronDownFill
            size={16}
            className='Layer__tasks__expand-icon'
            style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
            }}
          />
        </div>
        <div className={taskBodyClassName}>
          <div className='Layer__tasks-list-item__body-info'>
            <P size='sm' variant='inherit'>{task.question}</P>
            <TextArea
              value={userResponse}
              placeholder={task.userResponseType === TaskUserResponseType.UploadDocument ? t('bookkeeping:label.optional_description', 'Optional description') : ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUserResponse(e.target.value)}
            />
            {task.userResponseType === TaskUserResponseType.UploadDocument
              ? (
                <div className='Layer__tasks-list__link-list'>
                  {selectedFiles
                    ? (
                      <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:label.selected_files', 'Selected Files:')}</div>
                    )
                    : task.documents
                      ? (
                        <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:label.uploaded_files', 'Uploaded Files:')}</div>
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
              {task.userResponseType === TaskUserResponseType.UploadDocument
                ? uploadDocumentAction
                : (
                  <Button
                    disabled={
                      isSubmittingResponse
                      || userResponse.length === 0
                      || userResponse === task.userResponse
                    }
                    variant={ButtonVariant.secondary}
                    onClick={() => {
                      void handleSubmitUserResponseForTask({ taskId: task.id, userResponse })
                        .then(() => {
                          setIsOpen(false)
                        })
                    }}
                  >
                    {task.userResponse && task.userResponse !== userResponse
                      ? t('common:action.update_label', 'Update')
                      : t('common:action.save_label', 'Save')}
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TasksListItem.displayName = 'TasksListItem'

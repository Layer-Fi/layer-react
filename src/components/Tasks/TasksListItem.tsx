import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { isCompletedTask, type UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { getIconForTask } from '@utils/bookkeeping/tasks/getBookkeepingTaskStatusIcon'
import { useDeleteUploadsOnTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/delete/useDeleteUploadsOnTask'
import { useUpdateTaskUploadDescription } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/update-description/useUpdateTaskUploadDescription'
import { useUploadDocumentsForTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/useUploadDocumentsForTask'
import { useSubmitUserResponseForTask } from '@hooks/api/businesses/[business-id]/tasks/[task-id]/user-response/useSubmitResponseForTask'
import ChevronDownFill from '@icons/ChevronDownFill'
import { Button, ButtonVariant } from '@components/Button/Button'
import { FileInput } from '@components/Input/FileInput'
import { Textarea } from '@components/Textarea/Textarea'
import { Text, TextSize } from '@components/Typography/Text'

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
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [userResponse, setUserResponse] = useState(task.user_response ?? '')
  const [selectedFiles, setSelectedFiles] = useState<File[]>()

  const { trigger: handleSubmitUserResponseForTask } = useSubmitUserResponseForTask()
  const { trigger: handleUploadDocumentsForTask } = useUploadDocumentsForTask()
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
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [isOpen, onExpandTask])

  const uploadDocumentAction = useMemo(() => {
    if (task.user_response_type === 'UPLOAD_DOCUMENT') {
      if (task.status === 'TODO') {
        if (!selectedFiles) {
          return (
            <FileInput
              onUpload={(files: File[]) => {
                setSelectedFiles(files)
              }}
              text={t('bookkeeping:selectFiles', 'Select files')}
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
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => void submit()}
              >
                {t('common:submit', 'Submit')}
              </Button>
            </>
          )
        }
      }
      else if (task.status === 'USER_MARKED_COMPLETED') {
        if (task.user_response && task.user_response != userResponse) {
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
              {t('common:update', 'Update')}
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
              {t('bookkeeping:deleteUploads', 'Delete Uploads')}
            </Button>
          )
        }
      }
      else { return null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, task, selectedFiles, userResponse])

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
            <Text size={TextSize.md}>{task.title}</Text>
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
            <Text size={TextSize.sm}>{task.question}</Text>
            <Textarea
              value={userResponse}
              placeholder={task.user_response_type === 'UPLOAD_DOCUMENT' ? t('bookkeeping:optionalDescription', 'Optional description') : ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUserResponse(e.target.value)}
            />
            {task.user_response_type === 'UPLOAD_DOCUMENT'
              ? (
                <div className='Layer__tasks-list__link-list'>
                  {selectedFiles
                    ? (
                      <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:selectedFiles', 'Selected Files:')}</div>
                    )
                    : task.documents
                      ? (
                        <div className='Layer__tasks-list__link-list-header'>{t('bookkeeping:uploadedFiles', 'Uploaded Files:')}</div>
                      )
                      : null}
                  <ul className='Layer__tasks-list__links-list'>
                    {task.documents?.map((document, idx) => (
                      <li key={`uploaded-doc-name-${idx}`}><a className='Layer__tasks-list-item__link' href={document.presigned_url.presignedUrl}>{document.file_name}</a></li>
                    ))}
                    {selectedFiles?.map((file, idx) => (
                      <li key={`selected-file-name-${idx}`}><a className='Layer__tasks-list-item__link'>{file.name}</a></li>
                    ))}
                  </ul>
                </div>
              )
              : null}
            <div className='Layer__tasks-list-item__actions'>
              {task.user_response_type === 'UPLOAD_DOCUMENT'
                ? uploadDocumentAction
                : (
                  <Button
                    disabled={
                      userResponse.length === 0
                      || userResponse === task.user_response
                    }
                    variant={ButtonVariant.secondary}
                    onClick={() => {
                      void handleSubmitUserResponseForTask({ taskId: task.id, userResponse })
                        .then(() => {
                          setIsOpen(false)
                        })
                    }}
                  >
                    {task.user_response && task.user_response !== userResponse
                      ? t('common:update', 'Update')
                      : t('common:save', 'Save')}
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

import { useEffect, useMemo, useState } from 'react'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { isComplete, Task } from '../../types/tasks'
import { Button, ButtonVariant } from '../Button'
import { FileInput } from '../Input'
import { Textarea } from '../Textarea'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'
import { useTasksContext } from './TasksContext'

export const TasksListItem = ({
  task,
  goToNextPageIfAllComplete,
  defaultOpen,
}: {
  task: Task
  goToNextPageIfAllComplete: (task: Task) => void
  defaultOpen: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [userResponse, setUserResponse] = useState(task.user_response || '')
  const [selectedFiles, setSelectedFiles] = useState<File[]>()

  const {
    submitResponseToTask, uploadDocumentsForTask, deleteUploadsForTask,
    updateDocUploadTaskDescription,
  } = useTasksContext()

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isComplete(task.status) && 'Layer__tasks-list-item--completed',
  )

  const taskHeadClassName = classNames(
    'Layer__tasks-list-item__head-info',
    isComplete(task.status)
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

    await uploadDocumentsForTask(task.id, selectedFiles, userResponse)
    setIsOpen(false)
    goToNextPageIfAllComplete(task)
    setSelectedFiles(undefined)
  }

  const uploadDocumentAction = useMemo(() => {
    if (task.user_response_type === 'UPLOAD_DOCUMENT') {
      if (task.status === 'TODO') {
        if (!selectedFiles) {
          return (
            <FileInput
              onUpload={(files: File[]) => {
                setSelectedFiles(files)
              }}
              text='Select file(s)'
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
                Cancel
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => void submit()}
              >
                Submit
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
                updateDocUploadTaskDescription(task.id, userResponse)
              }}
            >
              Update
            </Button>
          )
        }
        else {
          return (
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => {
                deleteUploadsForTask(task.id)
              }}
            >
              Delete Uploads
            </Button>
          )
        }
      }
      else { return null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, selectedFiles, userResponse])

  return (
    <div className='Layer__tasks-list-item-wrapper'>
      <div className={taskItemClassName}>
        <div
          className='Layer__tasks-list-item__head'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={taskHeadClassName}>
            <div className='Layer__tasks-list-item__head-info__status'>
              {isComplete(task.status)
                ? (
                  <Check size={12} />
                )
                : (
                  <AlertCircle size={12} />
                )}
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
              placeholder={task.user_response_type === 'UPLOAD_DOCUMENT' ? 'Optional description' : ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUserResponse(e.target.value)}
            />
            {task.user_response_type === 'UPLOAD_DOCUMENT'
              ? (
                <div className='Layer__tasks-list__link-list'>
                  {selectedFiles
                    ? (
                      <div className='Layer__tasks-list__link-list-header'>Selected Files:</div>
                    )
                    : task.documents
                      ? (
                        <div className='Layer__tasks-list__link-list-header'>Uploaded Files:</div>
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
                      submitResponseToTask(task.id, userResponse)
                      setIsOpen(false)
                      goToNextPageIfAllComplete(task)
                    }}
                  >
                    {task.user_response && task.user_response !== userResponse
                      ? 'Update'
                      : 'Save'}
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

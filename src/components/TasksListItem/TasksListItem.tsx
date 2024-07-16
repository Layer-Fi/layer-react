import React, { useContext, useState } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { TaskTypes } from '../../types/tasks'
import { Button, ButtonVariant } from '../Button'
import { Textarea } from '../Textarea'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export const TasksListItem = ({
  task,
  index,
}: {
  task: TaskTypes
  index: number
}) => {
  const [isOpen, setIsOpen] = useState(index === 0 ? true : false)
  const [userResponse, setUserResponse] = useState(task.user_response || '')

  const { submitResponseToTask } = useContext(TasksContext)

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    task.status === 'COMPLETED' && 'Layer__tasks-list-item--completed',
  )

  const taskHeadClassName = classNames(
    'Layer__tasks-list-item__head-info',
    task.status === 'COMPLETED'
      ? 'Layer__tasks-list-item--completed'
      : 'Layer__tasks-list-item--pending',
  )

  const taskItemClassName = classNames(
    'Layer__tasks-list-item',
    isOpen && 'Layer__tasks-list-item__expanded',
  )

  return (
    <div className='Layer__tasks-list-item-wrapper'>
      <div className={taskItemClassName}>
        <div
          className='Layer__tasks-list-item__head'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={taskHeadClassName}>
            <div className='Layer__tasks-list-item__head-info__status'>
              {task.status === 'COMPLETED' ? (
                <Check size={12} />
              ) : (
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
              disabled={task.status === 'COMPLETED'}
              placeholder={userResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUserResponse(e.target.value)
              }
            />
            <div className='Layer__tasks-list-item__actions'>
              <Button
                disabled={
                  task.status === 'COMPLETED' || userResponse.length === 0
                }
                variant={ButtonVariant.secondary}
                onClick={() => submitResponseToTask(task.id, userResponse)}
              >
                {userResponse && userResponse.length === 0 ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

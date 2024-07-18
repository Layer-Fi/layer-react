import React, { useContext, useEffect, useState } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { isComplete, TaskTypes } from '../../types/tasks'
import { Button, ButtonVariant } from '../Button'
import { Textarea } from '../Textarea'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'
import { set } from 'date-fns'

export const TasksListItem = ({
  task,
  index,
}: {
  task: TaskTypes
  index: number
}) => {
  const [isOpen, setIsOpen] = useState(
    index === 0 && !isComplete(task.status) ? true : false,
  )
  const [userResponse, setUserResponse] = useState(task.user_response || '')

  const { submitResponseToTask } = useContext(TasksContext)

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

  return (
    <div className='Layer__tasks-list-item-wrapper'>
      <div className={taskItemClassName}>
        <div
          className='Layer__tasks-list-item__head'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={taskHeadClassName}>
            <div className='Layer__tasks-list-item__head-info__status'>
              {isComplete(task.status) ? (
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
              value={userResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUserResponse(e.target.value)
              }
            />
            <div className='Layer__tasks-list-item__actions'>
              <Button
                disabled={
                  userResponse.length === 0 ||
                  userResponse === task.user_response
                }
                variant={ButtonVariant.secondary}
                onClick={() => {
                  submitResponseToTask(task.id, userResponse)
                  setIsOpen(false)
                }}
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

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { findNextIncompleteTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Modal } from '@ui/Modal/Modal'
import { TasksTakeoverTask } from '@features/bookkeeping/TasksTakeover/TasksTakeoverTask'

import './tasksTakeover.scss'

type TasksTakeoverProps = {
  tasks: ReadonlyArray<UserVisibleTask>
  /** The task on screen; `null` closes the takeover. */
  taskId: string | null
  onTaskChange: (taskId: string | null) => void
}

/** Answers tasks one per screen on mobile, moving on to the next incomplete task after each. */
export const TasksTakeover = ({ tasks, taskId, onTaskChange }: TasksTakeoverProps) => {
  const { t } = useTranslation()
  const task = taskId === null
    ? undefined
    : tasks.find(({ id }) => id === taskId) ?? findNextIncompleteTask(tasks, taskId)
  const resolvedTaskId = task?.id ?? null

  // Keeps the last task on screen while the modal plays its exit animation.
  const lastTaskRef = useRef(task)
  if (task) lastTaskRef.current = task
  const renderedTask = task ?? lastTaskRef.current

  useEffect(() => {
    if (taskId !== null && resolvedTaskId !== taskId) onTaskChange(resolvedTaskId)
  }, [onTaskChange, resolvedTaskId, taskId])

  return (
    <Modal
      isOpen={task !== undefined}
      variant='mobile-fullscreen'
      isKeyboardDismissDisabled
      aria-label={t('bookkeeping:TasksTakeover.label.bookkeeping_tasks', 'Bookkeeping tasks')}
    >
      {renderedTask ? <TasksTakeoverTask key={renderedTask.id} task={renderedTask} tasks={tasks} onTaskChange={onTaskChange} /> : null}
    </Modal>
  )
}

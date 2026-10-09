import { useRef } from 'react'
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

  // The last task on screen and the list it was in. Keeps it showing through the exit animation.
  const shownRef = useRef<{ task?: UserVisibleTask, tasks: ReadonlyArray<UserVisibleTask> }>({ tasks })
  const last = shownRef.current

  const findTask = (id?: string) => tasks.find(task => task.id === id)
  const task = taskId === null
    ? undefined
    : findTask(taskId)
      // The open task left `tasks`: stay on its replacement, or move on from where it sat.
      ?? findTask(last.task?.id)
      ?? findTask(findNextIncompleteTask(last.tasks, taskId)?.id)

  if (task) shownRef.current = { task, tasks }
  const shown = shownRef.current

  return (
    <Modal
      isOpen={task !== undefined}
      variant='mobile-fullscreen'
      isKeyboardDismissDisabled
      aria-label={t('bookkeeping:TasksTakeover.label.bookkeeping_tasks', 'Bookkeeping tasks')}
    >
      {shown.task ? <TasksTakeoverTask key={shown.task.id} task={shown.task} tasks={shown.tasks} onTaskChange={onTaskChange} /> : null}
    </Modal>
  )
}

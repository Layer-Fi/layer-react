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

type ShownTask = {
  task?: UserVisibleTask
  tasks: ReadonlyArray<UserVisibleTask>
}

// When the open task leaves `tasks`, move on from where it sat in the list it was shown in, not from the top.
const findOpenTask = (tasks: ReadonlyArray<UserVisibleTask>, taskId: string, lastShown: ShownTask) =>
  tasks.find(({ id }) => id === taskId)
  ?? tasks.find(({ id }) => id === lastShown.task?.id)
  ?? findNextIncompleteTask(
    lastShown.tasks.flatMap((shown) => {
      if (shown.id === taskId) return [shown]
      const current = tasks.find(({ id }) => id === shown.id)
      return current ? [current] : []
    }),
    taskId,
  )

/** Answers tasks one per screen on mobile, moving on to the next incomplete task after each. */
export const TasksTakeover = ({ tasks, taskId, onTaskChange }: TasksTakeoverProps) => {
  const { t } = useTranslation()

  // Also keeps the last task and its list on screen while the modal plays its exit animation.
  const lastShownRef = useRef<ShownTask>({ tasks })
  const task = taskId === null ? undefined : findOpenTask(tasks, taskId, lastShownRef.current)
  if (task) lastShownRef.current = { task, tasks }
  const shown = task ? { task, tasks } : lastShownRef.current

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

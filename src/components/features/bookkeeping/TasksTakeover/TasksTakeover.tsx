import { useTranslation } from 'react-i18next'

import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
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
  const task = tasks.find(({ id }) => id === taskId)

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) onTaskChange(null)
  }

  return (
    <Modal
      isOpen={task !== undefined}
      onOpenChange={onOpenChange}
      variant='mobile-fullscreen'
      aria-label={t('bookkeeping:TasksTakeover.label.bookkeeping_tasks', 'Bookkeeping tasks')}
    >
      {task ? <TasksTakeoverTask key={task.id} task={task} tasks={tasks} onTaskChange={onTaskChange} /> : null}
    </Modal>
  )
}

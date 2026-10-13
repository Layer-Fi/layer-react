import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { findNextIncompleteTask, isIncompleteTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Modal } from '@ui/Modal/Modal'
import { TasksTakeoverTask } from '@features/bookkeeping/TasksTakeover/TasksTakeoverTask'

import './tasksTakeover.scss'

type TasksTakeoverProps = {
  tasks: ReadonlyArray<UnifiedAskFormTask>
  /** The task on screen; `null` closes the takeover. */
  taskId: string | null
  onTaskChange: (taskId: string | null) => void
}

/** Adds incomplete tasks missing from `taskIds`, each after the nearest task before it in `tasks`. */
const withNewIncompleteTasks = (taskIds: ReadonlyArray<string>, tasks: ReadonlyArray<UnifiedAskFormTask>) => {
  const merged = [...taskIds]
  let insertAt = 0
  for (const task of tasks) {
    const index = merged.indexOf(task.id)
    if (index !== -1) insertAt = index + 1
    else if (isIncompleteTask(task)) merged.splice(insertAt++, 0, task.id)
  }
  return merged.length === taskIds.length ? taskIds : merged
}

/** Answers tasks one per screen on mobile, moving on to the next incomplete task after each. */
export const TasksTakeover = ({ tasks, taskId, onTaskChange }: TasksTakeoverProps) => {
  const { t } = useTranslation()

  // The last task on screen and the list it was in. Keeps it showing through the exit animation.
  const shownRef = useRef<{ task?: UnifiedAskFormTask, tasks: ReadonlyArray<UnifiedAskFormTask> }>({ tasks })
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

  // The tasks left to answer since the takeover opened; answering one keeps it counted, so progress moves forward.
  // Kept after close so the exit animation keeps its count.
  const sessionRef = useRef<{ isOpen: boolean, taskIds: ReadonlyArray<string> }>({ isOpen: false, taskIds: [] })
  if (taskId === null) {
    sessionRef.current.isOpen = false
  }
  else {
    sessionRef.current = {
      isOpen: true,
      taskIds: withNewIncompleteTasks(sessionRef.current.isOpen ? sessionRef.current.taskIds : [], tasks),
    }
  }
  const sessionTaskIds = sessionRef.current.taskIds

  return (
    <Modal
      isOpen={task !== undefined}
      variant='mobile-fullscreen'
      isKeyboardDismissDisabled
      aria-label={t('bookkeeping:TasksTakeover.label.bookkeeping_tasks', 'Bookkeeping tasks')}
    >
      {shown.task
        ? (
          <TasksTakeoverTask
            key={shown.task.id}
            task={shown.task}
            tasks={shown.tasks}
            sessionTaskIds={sessionTaskIds}
            onTaskChange={onTaskChange}
          />
        )
        : null}
    </Modal>
  )
}

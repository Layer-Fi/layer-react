import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { findNextIncompleteTask, getIncompleteTasks, isIncompleteTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Modal } from '@ui/Modal/Modal'
import { TasksTakeoverTask } from '@features/bookkeeping/TasksTakeover/TasksTakeoverTask'

import './tasksTakeover.scss'

type TasksTakeoverProps = {
  tasks: ReadonlyArray<UnifiedAskFormTask>
  /** The task on screen; `null` closes the takeover. */
  taskId: string | null
  onTaskChange: (taskId: string | null) => void
}

/** Inserts each new open task into `taskIds` just after the last task from `taskIds` that precedes it in `tasks`. */
const withNewIncompleteTasks = (taskIds: ReadonlyArray<string>, tasks: ReadonlyArray<UnifiedAskFormTask>) => {
  const merged = [...taskIds]
  let insertAt = 0
  for (const task of tasks) {
    const index = merged.indexOf(task.id)
    if (index !== -1) insertAt = index + 1
    else if (isIncompleteTask(task)) merged.splice(insertAt++, 0, task.id)
  }
  return merged
}

type TasksTakeoverSessionProps = Omit<TasksTakeoverProps, 'taskId'> & { task: UnifiedAskFormTask }

/** Lives for one open of the takeover: the Modal drops its children once the exit animation ends. */
const TasksTakeoverSession = ({ task, tasks, onTaskChange }: TasksTakeoverSessionProps) => {
  // The tasks left to answer since the takeover opened; answering one keeps it counted, so progress moves forward.
  const [openedWith] = useState(() => getIncompleteTasks(tasks).map(({ id }) => id))
  const sessionRef = useRef(openedWith)
  sessionRef.current = withNewIncompleteTasks(sessionRef.current, tasks)

  return <TasksTakeoverTask key={task.id} task={task} tasks={tasks} sessionTaskIds={sessionRef.current} onTaskChange={onTaskChange} />
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

  return (
    <Modal
      isOpen={task !== undefined}
      variant='mobile-fullscreen'
      isKeyboardDismissDisabled
      aria-label={t('bookkeeping:TasksTakeover.label.bookkeeping_tasks', 'Bookkeeping tasks')}
    >
      {shown.task ? <TasksTakeoverSession task={shown.task} tasks={shown.tasks} onTaskChange={onTaskChange} /> : null}
    </Modal>
  )
}

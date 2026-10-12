import { useMemo } from 'react'

import { getCompletedTasks, getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { TasksListDesktop } from '@features/bookkeeping/TasksList/TasksListDesktop'
import { TasksListMobile } from '@features/bookkeeping/TasksList/TasksListMobile'

import './tasksList.scss'

type TasksListProps = {
  pageSize?: number
  mobile?: boolean
}

export const TasksList = ({ pageSize = 8, mobile }: TasksListProps) => {
  const { activePeriod } = useActiveBookkeepingPeriod()

  const sortedTasks = useMemo(() => {
    const tasksInPeriod = activePeriod?.tasks ?? []

    return [...getIncompleteTasks(tasksInPeriod), ...getCompletedTasks(tasksInPeriod)]
  }, [activePeriod?.tasks])

  if (sortedTasks.length === 0) return null

  return mobile
    ? <TasksListMobile tasks={sortedTasks} />
    : <TasksListDesktop tasks={sortedTasks} pageSize={pageSize} />
}

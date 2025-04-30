import { useMemo } from 'react'
import SmileIcon from '../../icons/SmileIcon'
import { Text, TextSize } from '../Typography'
import { TasksListItem } from './TasksListItem'
import { Pagination } from '../Pagination/Pagination'
import { TasksListMobile } from './TasksListMobile'
import { isCompletedTask, isIncompleteTask } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { useActiveBookkeepingPeriod } from '../../hooks/bookkeeping/periods/useActiveBookkeepingPeriod'
import { usePaginatedList } from '../../hooks/array/usePaginatedList'

const TasksEmptyState = () => (
  <div className='Layer__tasks-empty-state'>
    <div className='Layer__tasks-icon'>
      <SmileIcon />
    </div>
    <Text size={TextSize.sm}>
      There are no pending tasks!
      <br />
      {' '}
      Great job!
    </Text>
  </div>
)

type TasksListProps = {
  pageSize?: number
  mobile?: boolean
}

export function TasksList({ pageSize = 8, mobile }: TasksListProps) {
  const { activePeriod } = useActiveBookkeepingPeriod()

  const sortedTasks = useMemo(() => {
    const tasksInPeriod = activePeriod?.tasks ?? []

    return tasksInPeriod
      .sort((taskA, taskB) => {
        if (isCompletedTask(taskA) && isIncompleteTask(taskB)) {
          return 1
        }

        if (isIncompleteTask(taskA) && isCompletedTask(taskB)) {
          return -1
        }

        return 0
      })
  }, [activePeriod?.tasks])

  const { pageItems, pageIndex, set } = usePaginatedList(sortedTasks, pageSize)

  const indexFirstIncomplete = pageItems?.findIndex(task => isIncompleteTask(task))

  if (mobile) {
    return (
      <TasksListMobile
        tasksCount={sortedTasks.length}
        sortedTasks={pageItems}
        indexFirstIncomplete={indexFirstIncomplete}
        currentPage={pageIndex + 1}
        pageSize={pageSize}
        setCurrentPage={pageNumber => set(pageNumber - 1)}
      />
    )
  }

  return (
    <div className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0
        ? (
          <>
            {pageItems.map((task, index) => (
              <TasksListItem
                key={task.id}
                task={task}
                defaultOpen={index === indexFirstIncomplete}
              />
            ))}
            {sortedTasks.length > pageSize && (
              <Pagination
                currentPage={pageIndex + 1}
                totalCount={sortedTasks.length}
                pageSize={pageSize}
                onPageChange={pageNumber => set(pageNumber - 1)}
              />
            )}
          </>
        )
        : (
          <TasksEmptyState />
        )}
    </div>
  )
}

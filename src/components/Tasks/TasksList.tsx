import { useMemo, useState } from 'react'
import SmileIcon from '../../icons/SmileIcon'
import { Text, TextSize } from '../Typography'
import { BookkeepingPeriod } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useTasksContext } from './TasksContext'
import { isComplete, Task } from '../../types/tasks'
import { TasksListItem } from './TasksListItem'
import { Pagination } from '../Pagination/Pagination'
import { TasksListMobile } from './TasksListMobile'

function paginateArray<T>(array: ReadonlyArray<T>, chunkSize: number = 10): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    result.push(chunk)
  }
  return result
}

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

export const TasksList = ({ pageSize = 10, mobile }: { data?: BookkeepingPeriod[], pageSize?: number, mobile?: boolean }) => {
  const { currentMonthData } = useTasksContext()

  const tasks = useMemo(() => currentMonthData?.tasks || [], [currentMonthData?.tasks])

  const firstPageWithIncompleteTasks = paginateArray(
    tasks,
    pageSize,
  ).findIndex(page => page.some(d => !isComplete(d.status)))

  const [currentPage, setCurrentPage] = useState(
    firstPageWithIncompleteTasks === -1
      ? 1
      : firstPageWithIncompleteTasks + 1,
  )

  // Sort tasks by completion status and paginate
  const sortedTasks = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize

    return (tasks as Task[]).sort(x => isComplete(x.status) ? 1 : -1).slice(firstPageIndex, lastPageIndex)
  }, [currentPage, pageSize, tasks])

  const indexFirstIncomplete = sortedTasks?.findIndex(
    task => !isComplete(task.status),
  )

  const goToNextPage = (task: Task) => {
    const allComplete = sortedTasks
      ?.filter(taskInList => taskInList.id !== task.id)
      .every(task => isComplete(task.status))
    const hasMorePages = sortedTasks ? sortedTasks.length > pageSize * currentPage : false

    if (allComplete && hasMorePages) {
      setCurrentPage(currentPage + 1)
    }
  }

  console.log('mobile', mobile)

  if (mobile) {
    return (
      <TasksListMobile
        tasksCount={tasks.length}
        sortedTasks={sortedTasks}
        goToNextPage={goToNextPage}
        indexFirstIncomplete={indexFirstIncomplete}
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
      />
    )
  }

  return (
    <div className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0
        ? (
          <>
            {sortedTasks.map((task, index) => (
              <TasksListItem
                key={index}
                task={task}
                goToNextPageIfAllComplete={goToNextPage}
                defaultOpen={index === indexFirstIncomplete}
              />
            ))}
            {tasks && tasks.length >= 10 && (
              <Pagination
                currentPage={currentPage}
                totalCount={tasks?.length || 0}
                pageSize={pageSize}
                onPageChange={page => setCurrentPage(page)}
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

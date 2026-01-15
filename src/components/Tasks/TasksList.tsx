import { useCallback, useEffect, useMemo, useRef } from 'react'

import { isCompletedTask, isIncompleteTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { usePaginatedList } from '@hooks/array/usePaginatedList'
import { useActiveBookkeepingPeriod } from '@hooks/bookkeeping/periods/useActiveBookkeepingPeriod'
import SmileIcon from '@icons/SmileIcon'
import { VStack } from '@ui/Stack/Stack'
import { Pagination } from '@components/Pagination/Pagination'
import { TasksListItem } from '@components/Tasks/TasksListItem'
import { TasksListMobile } from '@components/Tasks/TasksListMobile'
import { Text, TextSize } from '@components/Typography/Text'

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

export const TasksList = ({ pageSize = 8, mobile }: TasksListProps) => {
  const { activePeriod } = useActiveBookkeepingPeriod()
  const taskListItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const requestAnimationFrameRef = useRef<number | null>(null)

  const setItemRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    taskListItemRefs.current[id] = el
  }, [])

  const onExpandTask = useCallback((taskId: string) => (isOpen: boolean) => {
    if (!isOpen) return

    if (requestAnimationFrameRef.current !== null) cancelAnimationFrame(requestAnimationFrameRef.current)

    const scrollNow = () => {
      const item = taskListItemRefs.current[taskId]

      if (!item) return

      item.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      })

      requestAnimationFrameRef.current = null
    }

    requestAnimationFrameRef.current = requestAnimationFrame(scrollNow)
  }, [])

  useEffect(() => {
    return () => {
      if (requestAnimationFrameRef.current !== null) cancelAnimationFrame(requestAnimationFrameRef.current)
    }
  }, [])

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

  const { pageItems, pageIndex, setPage } = usePaginatedList({ data: sortedTasks, pageSize })

  const indexFirstIncomplete = pageItems?.findIndex(task => isIncompleteTask(task))

  const onPageChange = useCallback((pageNumber: number) => {
    setPage(pageNumber - 1)
  }, [setPage])

  if (mobile) {
    return (
      <TasksListMobile
        tasksCount={sortedTasks.length}
        sortedTasks={pageItems}
        indexFirstIncomplete={indexFirstIncomplete}
        currentPage={pageIndex + 1}
        pageSize={pageSize}
        setCurrentPage={pageNumber => setPage(pageNumber - 1)}
      />
    )
  }

  return (
    <VStack className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0
        ? (
          <>
            {pageItems.map((task, index) => (
              <TasksListItem
                ref={setItemRef(task.id)}
                key={task.id}
                task={task}
                defaultOpen={index === indexFirstIncomplete}
                onExpandTask={onExpandTask(task.id)}
              />
            ))}
            {sortedTasks.length > pageSize && (
              <Pagination
                currentPage={pageIndex + 1}
                totalCount={sortedTasks.length}
                pageSize={pageSize}
                onPageChange={onPageChange}
              />
            )}
          </>
        )
        : (
          <TasksEmptyState />
        )}
    </VStack>
  )
}

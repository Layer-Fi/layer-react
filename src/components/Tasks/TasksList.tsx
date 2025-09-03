import { useCallback, useEffect, useMemo, useRef } from 'react'
import SmileIcon from '../../icons/SmileIcon'
import { Text, TextSize } from '../Typography'
import { TasksListItem } from './TasksListItem'
import { Pagination } from '../Pagination/Pagination'
import { TasksListMobile } from './TasksListMobile'
import { isCompletedTask, isIncompleteTask } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { useActiveBookkeepingPeriod } from '../../hooks/bookkeeping/periods/useActiveBookkeepingPeriod'
import { usePaginatedList } from '../../hooks/array/usePaginatedList'
import { VStack } from '../ui/Stack/Stack'

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
  const tasksListItemsContainerRef = useRef<HTMLDivElement | null>(null)
  const taskListItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const requestAnimationFrameRef = useRef<number | null>(null)

  const setItemRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    taskListItemRefs.current[id] = el
  }, [])

  const onExpandTask = useCallback((taskId: string) => (isOpen: boolean) => {
    if (!isOpen) return

    if (requestAnimationFrameRef.current !== null) cancelAnimationFrame(requestAnimationFrameRef.current)

    const scrollNow = () => {
      const container = tasksListItemsContainerRef.current
      const item = taskListItemRefs.current[taskId]
      if (!container || !item) return

      const itemRect = item.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const targetTop = itemRect.top - containerRect.top + container.scrollTop
      container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
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

  const { pageItems, pageIndex, set } = usePaginatedList(sortedTasks, pageSize)

  const indexFirstIncomplete = pageItems?.findIndex(task => isIncompleteTask(task))

  const onPageChange = useCallback((pageNumber: number) => {
    set(pageNumber - 1)
    tasksListItemsContainerRef?.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [set])

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
    <VStack className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0
        ? (
          <>
            <VStack className='Layer__tasks-list-items' ref={tasksListItemsContainerRef}>
              {pageItems.map((task, index) => (
                <TasksListItem
                  ref={setItemRef(task.id)}
                  key={task.id}
                  task={task}
                  defaultOpen={index === indexFirstIncomplete}
                  onExpandTask={onExpandTask(task.id)}
                />
              ))}
            </VStack>
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

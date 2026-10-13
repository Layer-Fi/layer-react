import { useCallback, useEffect, useRef } from 'react'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { isCompletedTask, isIncompleteTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import { AnimatedPresenceList } from '@components/utility/AnimatedPresenceList/AnimatedPresenceList'
import { Pagination } from '@ui/Pagination/Pagination'
import { VStack } from '@ui/Stack/Stack'
import { TasksListItem } from '@features/bookkeeping/TasksListItem/TasksListItem'

type TasksListDesktopProps = {
  /** Every task in the period, incomplete first. */
  tasks: ReadonlyArray<UnifiedAskFormTask>
  pageSize: number
}

export const TasksListDesktop = ({ tasks, pageSize }: TasksListDesktopProps) => {
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

  const { onPageChange, pageItems, pageIndex } = usePaginatedList({ data: tasks, pageSize })

  const indexFirstIncomplete = pageItems.findIndex(task => isIncompleteTask(task))

  return (
    <VStack className='Layer__tasks-list'>
      <AnimatedPresenceList key={pageIndex}>
        {pageItems.map((task, index) => (
          <TasksListItem
            ref={setItemRef(task.id)}
            // Completion changes the key, so the row collapses out here and back in at the bottom.
            key={`${task.id}:${isCompletedTask(task)}`}
            task={task}
            defaultOpen={index === indexFirstIncomplete}
            onExpandTask={onExpandTask(task.id)}
          />
        ))}
      </AnimatedPresenceList>
      {tasks.length > pageSize && (
        <Pagination
          currentPage={pageIndex + 1}
          totalCount={tasks.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </VStack>
  )
}

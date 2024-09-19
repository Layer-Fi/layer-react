import React, { useContext, useEffect, useMemo, useState } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import SmileIcon from '../../icons/SmileIcon'
import { isComplete, TaskTypes } from '../../types/tasks'
import { Pagination } from '../Pagination'
import { TasksListItem } from '../TasksListItem'
import { ErrorText, Text, TextSize } from '../Typography'

function paginateArray<T>(array: T[], chunkSize: number = 10): T[][] {
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
      <br /> Great job!
    </Text>
  </div>
)

export const TasksList = ({ pageSize = 10 }: { pageSize?: number }) => {
  const { data: tasks, error } = useContext(TasksContext)

  const firstPageWithIincompleteTasks = paginateArray(
    tasks || [],
    pageSize,
  ).findIndex(page => page.some(task => !isComplete(task.status)))

  const [currentPage, setCurrentPage] = useState(
    firstPageWithIincompleteTasks === -1
      ? 1
      : firstPageWithIincompleteTasks + 1,
  )

  const sortedTasks = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return tasks?.slice(firstPageIndex, lastPageIndex)
  }, [tasks, currentPage])

  const indexFirstIncomplete = sortedTasks?.findIndex(
    task => !isComplete(task.status),
  )

  const goToNextPage = (task: TaskTypes) => {
    const allComplete = sortedTasks
      ?.filter(taskInList => taskInList.id !== task.id)
      .every(task => isComplete(task.status))
    if (allComplete) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0 ? (
        <>
          {sortedTasks.map((task, index) => (
            <TasksListItem
              key={task.id}
              task={task}
              goToNextPageIfAllComplete={goToNextPage}
              defaultOpen={index === indexFirstIncomplete}
            />
          ))}
          {tasks && tasks.length >= 10 && (
            <div className='Layer__tasks__pagination'>
              <Pagination
                currentPage={currentPage}
                totalCount={tasks?.length || 0}
                pageSize={pageSize}
                onPageChange={page => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {error ? (
            <ErrorText>
              Approval failed. Check connection and retry in few seconds.
            </ErrorText>
          ) : (
            <TasksEmptyState />
          )}
        </>
      )}
    </div>
  )
}

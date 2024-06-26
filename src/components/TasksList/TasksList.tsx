import React, { useContext, useMemo, useState } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import SmileIcon from '../../icons/SmileIcon'
import { Pagination } from '../Pagination'
import { TasksListItem } from '../TasksListItem'
import { ErrorText, Text, TextSize } from '../Typography'

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
  const [currentPage, setCurrentPage] = useState(1)
  const { data: tasks, error } = useContext(TasksContext)

  const sortedTasks = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return tasks
      ?.sort(a => (a.status === 'COMPLETED' ? 1 : -1))
      ?.slice(firstPageIndex, lastPageIndex)
  }, [tasks, currentPage])

  return (
    <div className='Layer__tasks-list'>
      {sortedTasks && sortedTasks.length > 0 ? (
        <>
          {sortedTasks.map((task, index) => (
            <TasksListItem key={index} task={task} index={index} />
          ))}
          {tasks && (
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

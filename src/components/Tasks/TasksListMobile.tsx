import { useState } from 'react'

import { getIncompleteTasks, type UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { Button } from '@components/Button/Button'
import { TextButton } from '@components/Button/TextButton'
import { MobilePanel } from '@components/MobilePanel/MobilePanel'
import { Pagination } from '@components/Pagination/Pagination'
import { TasksListItem } from '@components/Tasks/TasksListItem'

const MOBILE_SHOW_UNRESOLVED_TASKS_COUNT = 2

type TasksListMobileProps = {
  tasksCount: number
  sortedTasks: ReadonlyArray<UserVisibleTask>
  indexFirstIncomplete: number
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
}

export const TasksListMobile = ({
  tasksCount,
  sortedTasks,
  indexFirstIncomplete,
  currentPage,
  pageSize,
  setCurrentPage,
}: TasksListMobileProps) => {
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const unresolvedTasks = getIncompleteTasks(sortedTasks).slice(0, MOBILE_SHOW_UNRESOLVED_TASKS_COUNT)

  return (
    <div className='Layer__tasks-list'>
      {unresolvedTasks.map((task, index) => (
        <TasksListItem
          key={index}
          task={task}
          defaultOpen={index === indexFirstIncomplete}
        />
      ))}
      {unresolvedTasks.length === 0 && tasksCount > 0
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <TextButton onClick={() => setShowMobilePanel(true)}>Show completed tasks</TextButton>
          </div>
        )
        : null}
      {unresolvedTasks.length !== 0 && tasksCount > unresolvedTasks.length
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <Button onClick={() => setShowMobilePanel(true)} fullWidth>
              Show all tasks (
              {tasksCount}
              )
            </Button>
          </div>
        )
        : null}
      <MobilePanel
        open={showMobilePanel}
        onClose={() => setShowMobilePanel(false)}
        header={<p>Tasks</p>}
      >
        {sortedTasks && sortedTasks.length > 0
          && (
            <div className='Layer__tasks-list'>
              {sortedTasks.map((task, index) => (
                <TasksListItem
                  key={index}
                  task={task}
                  defaultOpen={index === indexFirstIncomplete}
                />
              ))}
              {tasksCount > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalCount={tasksCount}
                  pageSize={pageSize}
                  onPageChange={page => setCurrentPage(page)}
                />
              )}
            </div>
          )}
      </MobilePanel>
    </div>
  )
}

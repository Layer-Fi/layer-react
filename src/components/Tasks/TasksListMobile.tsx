import { Button } from '../Button/Button'
import { MobilePanel } from '../MobilePanel/MobilePanel'
import { TextButton } from '../Button'
import { useState } from 'react'
import { isComplete, Task } from '../../types/tasks'
import { TasksListItem } from './TasksListItem'
import { Pagination } from '../Pagination/Pagination'

const MOBILE_SHOW_UNRESOLVED_TASKS_COUNT = 2

type TasksListMobileProps = {
  tasksCount: number
  sortedTasks: Task[]
  goToNextPage: (task: Task) => void
  indexFirstIncomplete: number
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
}

export const TasksListMobile = ({
  tasksCount,
  sortedTasks,
  goToNextPage,
  indexFirstIncomplete,
  currentPage,
  pageSize,
  setCurrentPage,
}: TasksListMobileProps) => {
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const unresolvedTasks = sortedTasks?.filter(task => !isComplete(task.status)).slice(0, MOBILE_SHOW_UNRESOLVED_TASKS_COUNT)
  const totalTasks = sortedTasks?.length

  return (
    <div className='Layer__tasks-list'>
      {unresolvedTasks.map((task, index) => (
        <TasksListItem
          key={index}
          task={task}
          goToNextPageIfAllComplete={goToNextPage}
          defaultOpen={index === indexFirstIncomplete}
        />
      ))}
      {unresolvedTasks.length === 0 && totalTasks > 0
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <TextButton onClick={() => setShowMobilePanel(true)}>Show completed tasks</TextButton>
          </div>
        )
        : null}
      {unresolvedTasks.length !== 0 && totalTasks > unresolvedTasks.length
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <Button onClick={() => setShowMobilePanel(true)} fullWidth>
              Show all tasks (
              {totalTasks}
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
                goToNextPageIfAllComplete={goToNextPage}
                defaultOpen={index === indexFirstIncomplete}
              />
            ))}
            {tasksCount >= 10 && (
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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getIncompleteTasks, isAutomatedTask, isHumanTask, type UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { Button } from '@components/Button/Button'
import { TextButton } from '@components/Button/TextButton'
import { MobilePanel } from '@components/MobilePanel/MobilePanel'
import { Pagination } from '@components/Pagination/Pagination'
import { BulkCategorizationTaskListItem } from '@components/Tasks/BulkCategorizationTaskListItem'
import { getBulkCategorizationTaskDescription, mapAutomatedTaskToBulkCategorizationTransactions } from '@components/Tasks/bulkCategorizationTaskMappers'
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
  const { t } = useTranslation()
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const unresolvedTasks = getIncompleteTasks(sortedTasks).slice(0, MOBILE_SHOW_UNRESOLVED_TASKS_COUNT)

  return (
    <div className='Layer__tasks-list'>
      {unresolvedTasks.map((task, index) => (
        isAutomatedTask(task)
          ? (
            <BulkCategorizationTaskListItem
              key={task.id}
              task={task}
              defaultOpen={index === indexFirstIncomplete}
              description={getBulkCategorizationTaskDescription(task)}
              transactions={mapAutomatedTaskToBulkCategorizationTransactions(task)}
            />
          )
          : isHumanTask(task)
            ? (
              <TasksListItem
                key={task.id}
                task={task}
                defaultOpen={index === indexFirstIncomplete}
              />
            )
            : null
      ))}
      {unresolvedTasks.length === 0 && tasksCount > 0
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <TextButton onClick={() => setShowMobilePanel(true)}>{t('showCompletedTasks', 'Show completed tasks')}</TextButton>
          </div>
        )
        : null}
      {unresolvedTasks.length !== 0 && tasksCount > unresolvedTasks.length
        ? (
          <div style={{ textAlign: 'center', padding: '12px 24px' }}>
            <Button onClick={() => setShowMobilePanel(true)} fullWidth>
              {t('showAllTasksCount', 'Show all tasks ({{tasksCount}})', { tasksCount })}
            </Button>
          </div>
        )
        : null}
      <MobilePanel
        open={showMobilePanel}
        onClose={() => setShowMobilePanel(false)}
        header={<p>{t('tasks', 'Tasks')}</p>}
      >
        {sortedTasks && sortedTasks.length > 0
          && (
            <div className='Layer__tasks-list'>
              {sortedTasks.map((task, index) => (
                isAutomatedTask(task)
                  ? (
                    <BulkCategorizationTaskListItem
                      key={task.id}
                      task={task}
                      defaultOpen={index === indexFirstIncomplete}
                      description={getBulkCategorizationTaskDescription(task)}
                      transactions={mapAutomatedTaskToBulkCategorizationTransactions(task)}
                    />
                  )
                  : isHumanTask(task)
                    ? (
                      <TasksListItem
                        key={task.id}
                        task={task}
                        defaultOpen={index === indexFirstIncomplete}
                      />
                    )
                    : null
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

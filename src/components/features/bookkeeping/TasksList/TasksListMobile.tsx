import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getIncompleteTasks, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { MobileList } from '@blocks/MobileList/MobileList'
import { TasksEmptyState } from '@features/bookkeeping/TasksList/TasksEmptyState'
import { TasksListMobileItem } from '@features/bookkeeping/TasksList/TasksListMobileItem'
import { TasksTakeover } from '@features/bookkeeping/TasksTakeover/TasksTakeover'

// The period is loaded before the list renders, so the list itself never errors.
const LIST_SLOTS = { EmptyState: TasksEmptyState, ErrorState: () => null }

type TasksListMobileProps = {
  /** Every task in the period, incomplete first; answered tasks stay listed so their answers can be viewed. */
  tasks: ReadonlyArray<UserVisibleTask>
}

export const TasksListMobile = ({ tasks }: TasksListMobileProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const incompleteTasks = getIncompleteTasks(tasks)
  const [firstIncompleteTask] = incompleteTasks

  return (
    <VStack gap='md' pbe='md'>
      <MobileList
        ariaLabel={t('bookkeeping:TasksList.TasksListMobile.label.tasks', 'Tasks')}
        data={tasks}
        isLoading={false}
        isError={false}
        slots={LIST_SLOTS}
        renderItem={task => <TasksListMobileItem task={task} />}
        onClickItem={task => setOpenTaskId(task.id)}
      />
      {firstIncompleteTask
        ? (
          <VStack pi='md'>
            <Button fullWidth onPress={() => setOpenTaskId(firstIncompleteTask.id)}>
              {tPlural(t, 'bookkeeping:TasksList.TasksListMobile.action.answer_tasks', {
                count: incompleteTasks.length,
                displayCount: formatNumber(incompleteTasks.length),
                one: 'Answer task',
                other: 'Answer {{displayCount}} tasks',
              })}
            </Button>
          </VStack>
        )
        : null}
      <TasksTakeover tasks={tasks} taskId={openTaskId} onTaskChange={setOpenTaskId} />
    </VStack>
  )
}

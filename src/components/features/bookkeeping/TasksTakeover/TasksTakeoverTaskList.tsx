import { useCallback, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { getCompletedTasks, getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Drawer } from '@ui/Modal/Modal'
import { ModalDescription, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { MobileList, type MobileListGroup } from '@blocks/MobileList/MobileList'
import { TaskRow } from '@features/bookkeeping/TaskRow/TaskRow'

const LIST_SLOTS = { EmptyState: () => null, ErrorState: () => null }
const ROW_SLOTS = { Trailing: <ChevronRight size={16} aria-hidden /> }

type TasksTakeoverTaskListProps = {
  tasks: ReadonlyArray<UnifiedAskFormTask>
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onTaskChange: (taskId: string) => void
}

/** The period's tasks, open first, in a drawer over the takeover; picking one closes it and shows that task. */
export const TasksTakeoverTaskList = ({ tasks, isOpen, onOpenChange, onTaskChange }: TasksTakeoverTaskListProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const incompleteTasks = getIncompleteTasks(tasks)
  const completedTasks = getCompletedTasks(tasks)

  const Header = useCallback(() => (
    <ModalTitleWithClose
      heading={<ModalHeading size='md' weight='bold'>{t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.bookkeeping_tasks', 'Bookkeeping tasks')}</ModalHeading>}
      description={(
        <ModalDescription size='sm' variant='subtle'>
          {t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.progress', '{{openCount}} open · {{completedCount}} done', {
            openCount: formatNumber(incompleteTasks.length),
            completedCount: formatNumber(completedTasks.length),
          })}
        </ModalDescription>
      )}
      hideBottomPadding
    />
  ), [completedTasks.length, formatNumber, incompleteTasks.length, t])

  const slots = useMemo(() => ({ Header }), [Header])

  const groups: MobileListGroup<UnifiedAskFormTask>[] = [
    { label: t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.open', 'Open'), items: incompleteTasks },
    { label: t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.completed', 'Completed'), items: completedTasks },
  ].filter(({ items }) => items.length > 0)

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant='mobile-drawer'
      isDismissable
      aria-label={t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.bookkeeping_tasks', 'Bookkeeping tasks')}
      slots={slots}
    >
      <VStack pi='md' pbs='sm' pbe='md'>
        <MobileList
          ariaLabel={t('bookkeeping:TasksTakeover.TasksTakeoverTaskList.label.bookkeeping_tasks', 'Bookkeeping tasks')}
          data={{ groups }}
          isLoading={false}
          isError={false}
          slots={LIST_SLOTS}
          renderItem={task => <TaskRow task={task} slots={ROW_SLOTS} />}
          onClickItem={(task) => {
            onTaskChange(task.id)
            onOpenChange(false)
          }}
        />
      </VStack>
    </Drawer>
  )
}

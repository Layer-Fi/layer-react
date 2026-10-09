import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'

export const TasksEmptyState = () => {
  const { t } = useTranslation()
  const { formatMonthName } = useIntlFormatter()
  const { activePeriod } = useActiveBookkeepingPeriod()

  return (
    <DataState
      status={DataStateStatus.allDone}
      title={activePeriod
        ? t('bookkeeping:TasksList.TasksEmptyState.empty.no_tasks_for_month', 'No tasks for {{monthName}}', { monthName: formatMonthName(activePeriod.month) })
        : t('bookkeeping:TasksList.TasksEmptyState.empty.no_tasks', 'No tasks')}
      description={t('bookkeeping:TasksList.TasksEmptyState.empty.questions_show_up_here', 'Questions about your books will show up here.')}
      spacing
    />
  )
}

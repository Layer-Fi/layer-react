import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'
import { getIconForTask } from '@features/bookkeeping/TasksListItem/getIconForTask'

export const TasksListMobileItem = ({ task }: { task: UserVisibleTask }) => {
  const { t } = useTranslation()
  const { formatNumber, formatCurrencyFromCents } = useIntlFormatter()
  const isCompleted = isCompletedTask(task)

  const getDetail = () => {
    if (isCompleted) return task.answerSummary ?? null
    if (task.transactions.length === 0) return null

    return tPlural(t, 'bookkeeping:TasksList.TasksListMobileItem.label.transactions_total', {
      count: task.transactions.length,
      displayCount: formatNumber(task.transactions.length),
      total: formatCurrencyFromCents(task.transactions.reduce((sum, { amount }) => sum + Math.abs(amount), 0)),
      one: '{{displayCount}} transaction · {{total}}',
      other: '{{displayCount}} transactions · {{total}}',
    })
  }

  const detail = getDetail()

  return (
    <HStack align='center' gap='sm' fluid>
      <Span status={isCompleted ? 'success' : 'warning'}>{getIconForTask(task)}</Span>
      <HStack fluid overflow='hidden'>
        <MobileListItemContent title={task.title}>
          {detail ? <Span size='sm' variant='subtle' ellipsis>{detail}</Span> : null}
        </MobileListItemContent>
      </HStack>
      <ChevronRight size={16} aria-hidden />
    </HStack>
  )
}

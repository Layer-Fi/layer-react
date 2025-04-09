import { useBookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriodStatus'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { Text, TextSize } from '../Typography/Text'
import { format, getMonth } from 'date-fns'
import { VStack } from '../ui/Stack/Stack'
import { Button } from '../Button'
import pluralize from 'pluralize'
import { HeaderRow } from '../Header/HeaderRow'
import { HeaderCol } from '../Header/HeaderCol'
import { isIncompleteTask } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'

type BookkeepingStatusReportRowProps = {
  currentDate: Date
  onViewBookkeepingTasks?: () => void
}

export const BookkeepingStatusReportRow = ({ currentDate, onViewBookkeepingTasks }: BookkeepingStatusReportRowProps) => {
  const { status, data } = useBookkeepingPeriodStatus({ currentMonthDate: currentDate })

  if (!status) {
    return null
  }

  const unresolvedTasksCount = data?.tasks.filter(task => isIncompleteTask(task)).length

  const buildAction = () => {
    switch (status) {
      case 'NOT_STARTED':
      case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
      case 'CLOSING_IN_REVIEW':
        return (
          <Text size={TextSize.sm} status='disabled' className='Layer__bookkeeping-status-report-row-text'>
            {`Bookkeeping team is preparing your ${format(currentDate, 'MMMM')} report. The report can change and current numbers might not be final.`}
          </Text>
        )
      case 'IN_PROGRESS_AWAITING_CUSTOMER':
      case 'CLOSED_OPEN_TASKS':
        return (
          <>
            <Text size={TextSize.sm} status='disabled' className='Layer__bookkeeping-status-report-row-text'>
              {`Bookkeeping team is preparing your ${format(currentDate, 'MMMM')} report. You have ${pluralize('task', unresolvedTasksCount, true)} awaiting your response.`}
            </Text>
            {onViewBookkeepingTasks && unresolvedTasksCount !== undefined && unresolvedTasksCount > 0
              ? (
                <Button onClick={onViewBookkeepingTasks}>{`Complete ${format(currentDate, 'MMMM')} tasks`}</Button>
              )
              : null}
          </>
        )
      default:
        return
    }
  }

  return (
    <HeaderRow className='Layer__bookkeeping-status-report-row'>
      <HeaderCol>
        <VStack gap='3xs'>
          <Text size={TextSize.lg}>{format(currentDate, 'MMMM yyyy')}</Text>
          <BookkeepingStatus status={status} month={getMonth(currentDate) + 1} />
        </VStack>
      </HeaderCol>
      <HeaderCol>
        {buildAction()}
      </HeaderCol>
    </HeaderRow>
  )
}

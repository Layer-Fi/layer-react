import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { getBookkeepingStatusConfig } from './utils'

type BookkeepingStatusDescriptionProps = {
  month: number
  status: BookkeepingPeriodStatus
  incompleteTasksCount: number
}

export const BookkeepingStatusDescription = ({ month, status, incompleteTasksCount }: BookkeepingStatusDescriptionProps) => {
  const statusConfig = getBookkeepingStatusConfig({ status, month, incompleteTasksCount })
  if (!statusConfig) {
    return null
  }

  return (
    <Text size={TextSize.sm} status='disabled'>
      {statusConfig.description}
    </Text>
  )
}

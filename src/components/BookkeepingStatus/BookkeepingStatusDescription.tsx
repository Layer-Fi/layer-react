import { Text, TextSize } from '@components/Typography/Text'
import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { getBookkeepingStatusConfig } from '@components/BookkeepingStatus/utils'

type BookkeepingStatusDescriptionProps = {
  monthNumber: number
  status: BookkeepingPeriodStatus
  incompleteTasksCount: number
}

export const BookkeepingStatusDescription = ({ monthNumber, status, incompleteTasksCount }: BookkeepingStatusDescriptionProps) => {
  const statusConfig = getBookkeepingStatusConfig({ status, monthNumber, incompleteTasksCount })
  if (!statusConfig) {
    return null
  }

  return (
    <Text size={TextSize.sm} status='disabled'>
      {statusConfig.description}
    </Text>
  )
}

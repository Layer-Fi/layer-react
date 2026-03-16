import { type BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useBookkeepingStatusConfig } from '@components/BookkeepingStatus/useBookkeepingStatusConfig'
import { Text, TextSize } from '@components/Typography/Text'

type BookkeepingStatusDescriptionProps = {
  monthNumber: number
  status: BookkeepingPeriodStatus
  incompleteTasksCount: number
}

export const BookkeepingStatusDescription = ({ monthNumber, status, incompleteTasksCount }: BookkeepingStatusDescriptionProps) => {
  const statusConfig = useBookkeepingStatusConfig({ status, monthNumber, incompleteTasksCount })
  if (!statusConfig) {
    return null
  }

  return (
    <Text size={TextSize.sm} status='disabled'>
      {statusConfig.description}
    </Text>
  )
}

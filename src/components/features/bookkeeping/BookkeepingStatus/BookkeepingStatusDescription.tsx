import { type BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { P } from '@ui/Typography/Text'
import { useBookkeepingStatusConfig } from '@features/bookkeeping/BookkeepingStatus/useBookkeepingStatusConfig'

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
    <P size='sm' status='disabled'>{statusConfig.description}</P>
  )
}

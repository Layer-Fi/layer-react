import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { getMonthNameFromNumber } from '../../utils/date'
import { Text, TextSize } from '../Typography/Text'

type BookkeepingStatusDescriptionProps = {
  month?: number
  status?: BookkeepingPeriodStatus
}

export const BookkeepingStatusDescription = ({ month, status }: BookkeepingStatusDescriptionProps) => {
  if (!status || month === undefined) {
    return
  }

  const buildStatus = () => {
    const monthName = getMonthNameFromNumber(month)

    switch (status) {
      case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
      case 'NOT_STARTED':
      case 'CLOSING_IN_REVIEW':
        return `We're working on your ${monthName} books. No action is needed from you right now.`
      case 'IN_PROGRESS_AWAITING_CUSTOMER':
      case 'CLOSED_OPEN_TASKS':
        return `Please respond to the below tasks to help us complete your ${monthName} books.`
      case 'CLOSED_COMPLETE':
        return `Your ${monthName} books are complete and ready to view!`
    }
  }

  return (
    <Text size={TextSize.sm} status='disabled'>{buildStatus()}</Text>
  )
}

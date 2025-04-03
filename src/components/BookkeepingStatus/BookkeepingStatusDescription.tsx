import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { buildStatus } from './utils'

type BookkeepingStatusDescriptionProps = {
  month?: number
  status?: BookkeepingPeriodStatus
}

export const BookkeepingStatusDescription = ({ month, status }: BookkeepingStatusDescriptionProps) => {
  if (!status || month === undefined) {
    return
  }

  return (
    <Text size={TextSize.sm} status='disabled'>{buildStatus(status, month)?.description}</Text>
  )
}

import { useTranslation } from 'react-i18next'

import { type BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { getBookkeepingStatusConfig } from '@components/BookkeepingStatus/utils'
import { Text, TextSize } from '@components/Typography/Text'

type BookkeepingStatusDescriptionProps = {
  monthNumber: number
  status: BookkeepingPeriodStatus
  incompleteTasksCount: number
}

export const BookkeepingStatusDescription = ({ monthNumber, status, incompleteTasksCount }: BookkeepingStatusDescriptionProps) => {
  const { t, i18n } = useTranslation()
  const statusConfig = getBookkeepingStatusConfig(
    { status, monthNumber, incompleteTasksCount, locale: i18n.language },
    t,
  )
  if (!statusConfig) {
    return null
  }

  return (
    <Text size={TextSize.sm} status='disabled'>
      {statusConfig.description}
    </Text>
  )
}

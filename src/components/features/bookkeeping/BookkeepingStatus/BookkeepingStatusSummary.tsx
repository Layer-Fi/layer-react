import { type BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { useBookkeepingStatusConfig } from '@features/bookkeeping/BookkeepingStatus/useBookkeepingStatusConfig'

import './bookkeepingStatusSummary.scss'

type BookkeepingStatusSummaryProps = {
  status: BookkeepingPeriodStatus
  monthNumber: number
  incompleteTasksCount: number
}

/** A period's status as an icon box beside its label and description. */
export const BookkeepingStatusSummary = ({ status, monthNumber, incompleteTasksCount }: BookkeepingStatusSummaryProps) => {
  const statusConfig = useBookkeepingStatusConfig({ status, monthNumber, incompleteTasksCount })
  if (!statusConfig) return null

  return (
    <HStack className='Layer__BookkeepingStatusSummary' gap='sm' align='center' {...toDataProperties({ status: statusConfig.color })}>
      <HStack className='Layer__BookkeepingStatusSummary__Icon' align='center' justify='center'>
        {statusConfig.icon}
      </HStack>
      <VStack gap='3xs'>
        <Span size='sm' weight='bold' status={statusConfig.color}>{statusConfig.label}</Span>
        <P size='sm' status='disabled'>{statusConfig.description}</P>
      </VStack>
    </HStack>
  )
}

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { type BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { useBookkeepingStatusConfig } from '@components/BookkeepingStatus/useBookkeepingStatusConfig'

import './bookkeepingStatus.scss'

type BookkeepingStatusProps = {
  monthNumber?: number
  status?: BookkeepingPeriodStatus
  text?: string
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, text, monthNumber, iconOnly }: BookkeepingStatusProps) => {
  const statusConfig = useBookkeepingStatusConfig({ status, monthNumber })
  if (!status || !statusConfig) {
    return
  }

  const dataProperties = toDataProperties({ status: statusConfig.color })

  return (
    <HStack className='Layer__bookkeeping-status' gap='3xs' align='center' {...dataProperties}>
      <span className='Layer__bookkeeping-status__icon-wrapper' data-status={statusConfig.color}>
        {statusConfig.icon}
      </span>
      {!iconOnly && (
        <Span size='sm' status={statusConfig.color}>
          {text ?? statusConfig.label}
        </Span>
      )}
    </HStack>
  )
}

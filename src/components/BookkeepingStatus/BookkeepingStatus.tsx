import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { getBookkeepingStatusConfig } from './utils'

type BookkeepingStatusProps = {
  monthNumber?: number
  status?: BookkeepingPeriodStatus
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, monthNumber, iconOnly }: BookkeepingStatusProps) => {
  if (!status || monthNumber === undefined) {
    return
  }

  const statusConfig = getBookkeepingStatusConfig({ status, monthNumber })
  if (!statusConfig) {
    return
  }

  const dataProperties = toDataProperties({ status: statusConfig.color })

  return (
    <span className='Layer__bookkeeping-status' {...dataProperties}>
      <span className='Layer__bookkeeping-status__icon-wrapper' data-status={statusConfig.color}>
        {statusConfig.icon}
      </span>
      {!iconOnly && (
        <Text
          size={TextSize.sm}
          status={statusConfig.color}
        >
          {statusConfig.label}
        </Text>
      )}
    </span>
  )
}

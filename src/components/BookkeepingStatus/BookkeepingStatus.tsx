import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { getBookkeepingStatusConfig } from './utils'

type BookkeepingStatusProps = {
  month?: number
  status?: BookkeepingPeriodStatus
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, month, iconOnly }: BookkeepingStatusProps) => {
  if (!status || month === undefined) {
    return
  }

  const statusConfig = getBookkeepingStatusConfig({ status, month })
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

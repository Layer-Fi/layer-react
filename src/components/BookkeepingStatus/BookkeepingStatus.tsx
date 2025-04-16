import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { getBookkeepingStatusConfig } from './utils'

type BookkeepingStatusProps = {
  monthNumber?: number
  status?: BookkeepingPeriodStatus
  text?: string
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, text, monthNumber, iconOnly }: BookkeepingStatusProps) => {
  if (!status) {
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
          {text ?? statusConfig.label}
        </Text>
      )}
    </span>
  )
}

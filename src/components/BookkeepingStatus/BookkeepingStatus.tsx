import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Text, TextSize } from '../Typography/Text'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { buildStatus } from './utils'

type BookkeepingStatusProps = {
  month?: number
  status?: BookkeepingPeriodStatus
  emphasizeWarning?: boolean
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, month, emphasizeWarning, iconOnly }: BookkeepingStatusProps) => {
  if (!status || month === undefined) {
    return
  }

  const statusConfig = buildStatus(status, month)

  if (!statusConfig) {
    return
  }

  const emphasize = statusConfig.color === 'warning' && emphasizeWarning
  const dataProperties = toDataProperties({ status: statusConfig.color, emphasize })

  return (
    <span className='Layer__bookkeping-status' {...dataProperties}>
      <span className='Layer__bookkeping-status__icon-wrapper' data-status={statusConfig.color}>
        {statusConfig.icon}
      </span>
      {!iconOnly && (
        <Text size={TextSize.sm} status={statusConfig.color} invertColor={emphasize}>{statusConfig.label}</Text>
      )}
    </span>
  )
}

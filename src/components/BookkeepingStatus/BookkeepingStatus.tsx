import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { type BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { getBookkeepingStatusConfig } from '@components/BookkeepingStatus/utils'
import { Text, TextSize } from '@components/Typography/Text'

import './bookkeepingStatus.scss'

type BookkeepingStatusProps = {
  monthNumber?: number
  status?: BookkeepingPeriodStatus
  text?: string
  iconOnly?: boolean
}

export const BookkeepingStatus = ({ status, text, monthNumber, iconOnly }: BookkeepingStatusProps) => {
  const { t, i18n } = useTranslation()
  if (!status) {
    return
  }

  const statusConfig = getBookkeepingStatusConfig({ status, monthNumber, locale: i18n.language }, t)
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

import { type DatePattern, toDate } from '@utils/time/dateIntl'
import { DateFormat } from '@utils/time/timeFormats'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span, type TextStyleProps } from '@ui/Typography/Text'
import { Text } from '@components/Typography/Text'

import './dateTime.scss'

interface BaseDateTimeProps {
  format?: DatePattern
  dateFormat?: DatePattern
  timeFormat?: DatePattern
  onlyDate?: boolean
  onlyTime?: boolean
  slotProps?: {
    Date?: TextStyleProps
    Time?: TextStyleProps
  }
}

interface DateTimeViaStringProps extends BaseDateTimeProps {
  value: string
  valueAsDate?: never
}

interface DateTimeViaDateProps extends BaseDateTimeProps {
  value?: never
  valueAsDate: Date
}

type DateTimeProps = DateTimeViaStringProps | DateTimeViaDateProps

export const DateTime = ({
  value,
  valueAsDate,
  format,
  dateFormat = DateFormat.DateShort,
  timeFormat = DateFormat.Time,
  onlyDate,
  onlyTime,
  slotProps = {
    Date: { size: 'sm' },
    Time: { size: 'sm', variant: 'subtle' },
  },
}: DateTimeProps) => {
  const { formatDate } = useIntlFormatter()

  const dateValue = valueAsDate ?? toDate(value)
  if (!dateValue) return null

  if (format) {
    return (
      <Text className='Layer__datetime'>
        {formatDate(dateValue, format)}
      </Text>
    )
  }

  const date = formatDate(dateValue, dateFormat)
  const time = formatDate(dateValue, timeFormat)

  return (
    <Text className='Layer__datetime'>
      {!onlyTime && (
        <Span {...slotProps.Date}>
          {date}
        </Span>
      )}
      {!onlyDate && (
        <Span {...slotProps.Time}>
          {time}
        </Span>
      )}
    </Text>
  )
}

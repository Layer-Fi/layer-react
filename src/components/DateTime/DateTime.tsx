import { Text } from '@components/Typography/Text'
import { DATE_FORMAT, TIME_FORMAT } from '@config/general'
import { parseISO, format as formatTime } from 'date-fns'
import { Span, TextStyleProps } from '@ui/Typography/Text'
import './dateTime.scss'

interface BaseDateTimeProps {
  format?: string
  dateFormat?: string
  timeFormat?: string
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
  dateFormat,
  timeFormat,
  onlyDate,
  onlyTime,
  slotProps = {
    Date: { size: 'sm' },
    Time: { size: 'sm', variant: 'subtle' },
  },
}: DateTimeProps) => {
  const dateValue = valueAsDate ?? parseISO(value)

  if (format) {
    return (
      <Text className='Layer__datetime'>
        {formatTime(dateValue, format)}
      </Text>
    )
  }

  const date = formatTime(dateValue, dateFormat ?? DATE_FORMAT)
  const time = formatTime(dateValue, timeFormat ?? TIME_FORMAT)

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

import { DATE_FORMAT, TIME_FORMAT } from '../../config/general'
import { Text } from '../Typography'
import { parseISO, format as formatTime } from 'date-fns'
import { Span, TextStyleProps } from '../ui/Typography/Text'

interface DateTimeProps {
  value: string
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

export const DateTime = ({
  value,
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
  if (format) {
    return (
      <Text className='Layer__datetime'>
        {formatTime(parseISO(value), format)}
      </Text>
    )
  }

  const date = formatTime(parseISO(value), dateFormat ?? DATE_FORMAT)
  const time = formatTime(parseISO(value), timeFormat ?? TIME_FORMAT)

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

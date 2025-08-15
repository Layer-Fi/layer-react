import { DATE_FORMAT, TIME_FORMAT } from '../../config/general'
import { Text, TextSize, TextWeight } from '../Typography'
import { parseISO, format as formatTime } from 'date-fns'
import { Span } from '../ui/Typography/Text'

interface DateTimeProps {
  value: string
  format?: string
  dateFormat?: string
  timeFormat?: string
  onlyDate?: boolean
  onlyTime?: boolean
  size?: TextSize
  weight?: TextWeight
  variant?: 'placeholder' | 'subtle'
}

export const DateTime = ({
  value,
  format,
  dateFormat,
  timeFormat,
  onlyDate,
  onlyTime,
  size = TextSize.sm,
  weight = TextWeight.bold,
  variant = 'subtle',
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
        <Span
          weight={weight}
          size={size}
          variant={variant}
        >
          {date}
        </Span>
      )}
      {!onlyDate && (
        <Span
          weight={weight}
          size={size}
          variant={variant}
        >
          {time}
        </Span>
      )}
    </Text>
  )
}

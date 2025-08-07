import { DATE_FORMAT, TIME_FORMAT } from '../../config/general'
import { Text, TextSize, TextWeight } from '../Typography'
import { parseISO, format as formatTime } from 'date-fns'

interface DateTimeProps {
  value: string
  format?: string
  dateFormat?: string
  timeFormat?: string
  onlyDate?: boolean
  onlyTime?: boolean
  size?: TextSize
  weight?: TextWeight
  color?: string
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
  color = 'base-800',
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
        <Text
          as='span'
          weight={weight}
          size={size}
          className='Layer__datetime__date'
          data-color={color}
        >
          {date}
        </Text>
      )}
      {!onlyDate && (
        <Text
          as='span'
          weight={weight}
          size={size}
          className='Layer__datetime__time'
          data-color={color}
        >
          {time}
        </Text>
      )}
    </Text>
  )
}

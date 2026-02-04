import { type ZonedDateTime, DateFormatter } from '@internationalized/date'

const formatDate = (date: ZonedDateTime): string => {
  const formatter = new DateFormatter('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return formatter.format(date.toDate())
}

export const getIsDateInvalid = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null }) => {
  if (date === null) return 'Cannot select empty date'
  if (minDate && date.compare(minDate) < 0) return `Cannot select date before ${formatDate(minDate)}`
  if (maxDate && date.compare(maxDate) > 0) return 'Cannot select date in the future'
  return null
}

import { ZonedDateTime } from '@internationalized/date'

export const getIsDateInvalid = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null }) => {
  if (date === null) return 'Cannot select empty date'
  if (minDate && date.compare(minDate) < 0) return 'Cannot select date before the business activation date'
  if (maxDate && date.compare(maxDate) > 0) return 'Cannot select date after current date'
  return null
}

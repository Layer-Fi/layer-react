import type { ZonedDateTime } from '@internationalized/date'

import { formatDate } from '@utils/format'

export const getIsDateInvalid = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null }) => {
  if (date === null) return 'Cannot select empty date'
  if (minDate && date.compare(minDate) < 0) return `Cannot select date before ${formatDate(minDate.toDate())}`
  if (maxDate && date.compare(maxDate) > 0) return 'Cannot select date in the future'
  return null
}

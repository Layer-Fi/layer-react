import type { ZonedDateTime } from '@internationalized/date'
import i18next from 'i18next'

import { formatDate } from '@utils/format'

export const getIsDateInvalid = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null }) => {
  if (date === null) return i18next.t('cannotSelectEmptyDate', 'Cannot select empty date')
  if (minDate && date.compare(minDate) < 0) return i18next.t('cannotSelectDateBeforeVal', 'Cannot select date before {{val}}', { val: formatDate(minDate.toDate()) })
  if (maxDate && date.compare(maxDate) > 0) return i18next.t('cannotSelectDateInTheFuture', 'Cannot select date in the future')
  return null
}

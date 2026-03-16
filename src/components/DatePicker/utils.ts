import type { ZonedDateTime } from '@internationalized/date'
import type { TFunction } from 'i18next'

import { formatDate } from '@utils/format'

export const getIsDateInvalid = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null },
  t: TFunction,
) => {
  if (date === null) return t('date.cannotSelectEmptyDate', 'Cannot select empty date')
  if (minDate && date.compare(minDate) < 0) return t('date.cannotSelectDateBeforeMinDate', 'Cannot select date before {{minDate}}', { minDate: formatDate(minDate.toDate()) })
  if (maxDate && date.compare(maxDate) > 0) return t('date.cannotSelectDateInTheFuture', 'Cannot select date in the future')
  return null
}

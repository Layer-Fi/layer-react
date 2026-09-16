import type { DateFormatFn, DateRangeFormatFn, MonthNameFormatFn } from '@utils/shared/i18n/date/formatters'
import type { DurationFormatFn, SecondsDurationFormatFn } from '@utils/shared/i18n/duration/formatters'
import type { ListFormatFn } from '@utils/shared/i18n/list/formatters'
import type { CurrencyFormatFn, NumberFormatFn, PercentFormatFn } from '@utils/shared/i18n/number/formatters'

// Kept alongside the formatters it is built from, so pure helpers can accept a
// formatter without depending on the hook that constructs one.
export type IntlFormatter = {
  formatCurrencyFromCents: CurrencyFormatFn
  formatNumber: NumberFormatFn
  formatPercent: PercentFormatFn
  formatDate: DateFormatFn
  formatDateRange: DateRangeFormatFn
  formatMonthName: MonthNameFormatFn
  formatMinutesAsDuration: DurationFormatFn
  formatSecondsAsDuration: SecondsDurationFormatFn
  formatList: ListFormatFn
}

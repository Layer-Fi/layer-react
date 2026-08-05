import type { MoneyFormat } from '@internal-types/shared/money'
import type { DateSelectionMode } from '@utils/shared/date/dateRange'

export type TimeRangePickerConfig = {
  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  datePickerMode?: unknown

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  defaultDatePickerMode?: unknown

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  allowedDatePickerModes?: unknown

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  customDateRanges?: unknown

  dateSelectionMode?: DateSelectionMode

  csvMoneyFormat?: MoneyFormat
}

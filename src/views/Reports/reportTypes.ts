import type { MoneyFormat } from '@internal-types/general'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

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

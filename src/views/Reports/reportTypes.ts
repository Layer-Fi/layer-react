import type { MoneyFormat } from '@internal-types/general'
import type { DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export type TimeRangePickerConfig = {
  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  datePickerMode?: DateRangePickerMode

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  defaultDatePickerMode?: DateRangePickerMode

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>

  /**
   * @deprecated This property is no longer used. Use `dateSelectionMode` instead.
   */
  customDateRanges?: unknown

  dateSelectionMode?: 'month' | 'full'

  csvMoneyFormat?: MoneyFormat
}

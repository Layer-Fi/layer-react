import type { CustomDateRange } from '@components/DeprecatedDatePicker/DeprecatedDatePickerOptions'
import type { DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import type { MoneyFormat } from '@internal-types/general'

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
  customDateRanges?: CustomDateRange[]

  dateSelectionMode?: 'month' | 'full'

  csvMoneyFormat?: MoneyFormat
}

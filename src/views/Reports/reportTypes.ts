import type { CustomDateRange } from '../../components/DeprecatedDatePicker/DeprecatedDatePickerOptions'
import type { DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import type { MoneyFormat } from '../../types/general'

export type TimeRangePickerConfig = {
  /**
   * @deprecated Use `defaultDatePickerMode` instead
   */
  datePickerMode?: DateRangePickerMode
  defaultDatePickerMode?: DateRangePickerMode

  allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>
  csvMoneyFormat?: MoneyFormat
  customDateRanges?: CustomDateRange[]
}

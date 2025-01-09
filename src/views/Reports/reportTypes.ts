import type { CustomDateRange } from '../../components/DatePicker/DatePickerOptions'
import type { DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import type { MoneyFormat } from '../../types'

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

import type { CustomDateRange } from '../../components/DatePicker/DatePickerOptions'
import type { RangePickerMode } from '../../components/DatePicker/ModeSelector/DatePickerModeSelector'
import type { MoneyFormat } from '../../types'

export type RangeReportConfig = {
  /**
   * @deprecated Use `defaultDatePickerMode` instead
   */
  datePickerMode?: RangePickerMode
  defaultDatePickerMode?: RangePickerMode

  allowedDatePickerModes?: ReadonlyArray<RangePickerMode>
  csvMoneyFormat?: MoneyFormat
  customDateRanges?: CustomDateRange[]
}

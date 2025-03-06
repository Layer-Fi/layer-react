import { FC } from 'react'
import { CustomDateRange } from './DatePickerOptions'
import { DatePickerModeSelectorProps, UnifiedPickerMode } from './ModeSelector/DatePickerModeSelector'

export type NavigationArrows = 'desktop' | 'mobile'

export interface DatePickerProps {
  displayMode?: UnifiedPickerMode | 'timePicker'
  selected?: Date | [Date, Date | null]
  defaultSelected?: Date | [Date, Date | null]
  onChange: (date: Date | [Date, Date | null]) => void
  disabled?: boolean
  allowedModes?: ReadonlyArray<UnifiedPickerMode>
  dateFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
  customDateRanges?: CustomDateRange[]
  wrapperClassName?: string
  calendarClassName?: string
  popperClassName?: string
  currentDateOption?: boolean
  minDate?: Date
  maxDate?: Date | null
  navigateArrows?: NavigationArrows[]
  onChangeMode?: (mode: UnifiedPickerMode) => void
  syncWithGlobalDate?: boolean
  slots?: {
    ModeSelector: FC<DatePickerModeSelectorProps>
  }
}

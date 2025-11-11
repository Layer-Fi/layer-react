import { DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { getArrayWithAtLeastOneOrFallback, type ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'

export const DEFAULT_ALLOWED_PICKER_MODES = ['monthPicker'] as const

export const getAllowedDateRangePickerModes = ({
  allowedDatePickerModes,
  defaultDatePickerMode,
}: {
  allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>
  defaultDatePickerMode?: DateRangePickerMode
}): ReadonlyArrayWithAtLeastOne<DateRangePickerMode> =>
  getArrayWithAtLeastOneOrFallback(
    allowedDatePickerModes ?? (defaultDatePickerMode ? [defaultDatePickerMode] : []),
    DEFAULT_ALLOWED_PICKER_MODES,
  )

export const getInitialDateRangePickerMode = ({
  allowedDatePickerModes,
  defaultDatePickerMode,
}: {
  allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>
  defaultDatePickerMode?: DateRangePickerMode
}): DateRangePickerMode => {
  const allowedDateRangePickerModes = getAllowedDateRangePickerModes({ allowedDatePickerModes, defaultDatePickerMode })

  const initialRangeDisplayMode =
    defaultDatePickerMode && allowedDateRangePickerModes.includes(defaultDatePickerMode)
      ? defaultDatePickerMode
      : allowedDateRangePickerModes[0]

  return initialRangeDisplayMode
}

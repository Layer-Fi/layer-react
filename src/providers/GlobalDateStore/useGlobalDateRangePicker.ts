import { useCallback, useMemo } from 'react'
import {
  DateRangePickerMode,
  isDateRangePickerMode,
  useGlobalDateRange,
  useGlobalDateRangeActions,
} from './GlobalDateStoreProvider'
import {
  DEFAULT_ALLOWED_PICKER_MODES,
  type UnifiedPickerMode,
} from '../../components/DatePicker/ModeSelector/DatePickerModeSelector'
import { getArrayWithAtLeastOneOrFallback, type ReadonlyArrayWithAtLeastOne } from '../../utils/array/getArrayWithAtLeastOneOrFallback'

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

export type UseGlobalDateRangePickerProps = {
  displayMode: DateRangePickerMode
  setDisplayMode: (displayMode: DateRangePickerMode) => void
}

export function useGlobalDateRangePicker({ displayMode, setDisplayMode }: UseGlobalDateRangePickerProps) {
  const { start, end } = useGlobalDateRange({ displayMode })

  const { setRangeWithExplicitDisplayMode } = useGlobalDateRangeActions()

  const onChangeMode = useCallback((newMode: UnifiedPickerMode) => {
    if (isDateRangePickerMode(newMode)) {
      setDisplayMode(newMode)
    }
  }, [setDisplayMode])

  const dateOrDateRange = useMemo(() => {
    if (displayMode === 'monthPicker') {
      return start
    }

    /*
       * This intentionally needs to be cast to a mutable array. The `DatePicker`
       * component should accept a readonly array, but that refactor is out of scope.
       */
    return [start, end] as [Date, Date]
  }, [
    start,
    end,
    displayMode,
  ])

  const onChangeDateOrDateRange = useCallback((dates: Date | [Date, Date | null]) => {
    const dateProps = dates instanceof Date
      ? { start: dates, end: dates }
      : { start: dates[0], end: dates[1] ?? dates[0] }

    setRangeWithExplicitDisplayMode({ ...dateProps, displayMode })
  }, [displayMode, setRangeWithExplicitDisplayMode])

  return {
    rangeDisplayMode: displayMode,
    onChangeMode,
    dateOrDateRange,
    onChangeDateOrDateRange,
  }
}

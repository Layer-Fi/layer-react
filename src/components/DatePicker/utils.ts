import { endOfDay, endOfMonth } from 'date-fns'
import { DatePickerProps, NavigationArrows } from './types'
import { clampToPresentOrPast } from '../../utils/date'

export function buildDateStateInitialValue({
  syncWithGlobalDate = true,
  selected,
  displayMode,
  globalStartDate,
  globalEndDate,
}: {
  syncWithGlobalDate?: DatePickerProps['syncWithGlobalDate']
  selected?: Date | [Date, Date | null]
  displayMode?: DatePickerProps['displayMode']
  globalStartDate?: Date
  globalEndDate?: Date
}) {
  if (syncWithGlobalDate) {
    return {
      startDate: globalStartDate,
      endDate: globalEndDate,
    }
  }

  if (selected && isRangeMode(displayMode)) {
    return {
      startDate: (selected as [Date, Date])[0],
      endDate: (selected as [Date, Date])[1],
    }
  }

  if (selected) {
    return {
      startDate: selected as Date,
      endDate: endOfDay(selected as Date),
    }
  }

  if (!selected) {
    return {}
  }

  if (
    isRangeMode(displayMode)
    && (selected as [Date, Date])[0]
    && (selected as [Date, Date])[1]
  ) {
    return {
      startDate: (selected as [Date, Date])[0],
      endDate: (selected as [Date, Date])[1],
    }
  }

  return {
    startDate: selected as Date,
    endDate: endOfDay(selected as Date),
  }
}

export function isRangeMode(displayMode: DatePickerProps['displayMode']) {
  return displayMode === 'dayRangePicker' || displayMode === 'monthRangePicker'
}

export function showNavigationArrows(navigateArrows?: NavigationArrows[], isDesktop?: boolean) {
  return (navigateArrows && ((isDesktop && navigateArrows.includes('desktop')) || (!isDesktop && navigateArrows.includes('mobile'))))
}

export function getEndDateBasedOnMode(startDate: Date, displayMode: DatePickerProps['displayMode']) {
  switch (displayMode) {
    case 'monthPicker':
      return clampToPresentOrPast(endOfMonth(startDate))
    default:
      return endOfDay(startDate)
  }
}

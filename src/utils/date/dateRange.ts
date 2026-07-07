import { endOfDay, isEqual, isSameDay, max, min, startOfDay } from 'date-fns'

export type DateSelectionMode = 'full' | 'month' | 'year'

export type DateRange = { startDate: Date, endDate: Date }

export function isSameExactDateRange(a: DateRange, b: DateRange) {
  return isEqual(a.startDate, b.startDate) && isEqual(a.endDate, b.endDate)
}

export function isSameDateRangeDayGranularity(a: DateRange, b: DateRange) {
  return !!a.startDate && !!b.startDate && !!a.endDate && !!b.endDate
    && isSameDay(startOfDay(a.startDate), startOfDay(b.startDate))
    && isSameDay(endOfDay(a.endDate), endOfDay(b.endDate))
}

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

import { endOfDay, isEqual, max, min } from 'date-fns'

export type DateSelectionMode = 'full' | 'month' | 'year'

export type DateRange = { startDate: Date, endDate: Date }

export function isSameDateRange(a: DateRange, b: DateRange) {
  return isEqual(a.startDate, b.startDate) && isEqual(a.endDate, b.endDate)
}

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

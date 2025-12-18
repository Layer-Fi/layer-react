import { add, differenceInMonths, endOfMonth, startOfMonth, sub } from 'date-fns'

const MONTHS_IN_WINDOW = 12
const MAX_EDGE_SHIFT = 3

export interface ChartWindow {
  start: Date
  end: Date
}

export const areChartWindowsEqual = (a: ChartWindow, b: ChartWindow): boolean =>
  a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime()

const buildWindow = (start: Date): ChartWindow => {
  const normalizedStart = startOfMonth(start)
  return {
    start: normalizedStart,
    end: endOfMonth(add(normalizedStart, { months: MONTHS_IN_WINDOW - 1 })),
  }
}
const shiftWindow = (chartWindow: ChartWindow, months: number): ChartWindow => ({
  start: startOfMonth(add(chartWindow.start, { months })),
  end: endOfMonth(add(chartWindow.end, { months })),
})

export const getChartWindow = ({
  chartWindow, selectedDate, activationDate,
}: {
  chartWindow: ChartWindow
  selectedDate: Date
  activationDate: Date
}): ChartWindow => {
  const today = startOfMonth(Date.now())
  const minStart = startOfMonth(activationDate)
  const selected = startOfMonth(selectedDate)
  const windowStart = startOfMonth(chartWindow.start)
  const windowEnd = startOfMonth(chartWindow.end)

  // If business is less than 12 months old, always show last 12 months
  if (differenceInMonths(today, minStart) < MONTHS_IN_WINDOW) {
    return buildWindow(sub(today, { months: MONTHS_IN_WINDOW - 1 }))
  }

  const position = differenceInMonths(selected, windowStart)

  // Middle 10 months: no shift
  if (position >= 1 && position <= 10) {
    return chartWindow
  }

  // Leftmost: shift back up to 3 months (clamped to activation date)
  if (position === 0) {
    const shift = Math.min(MAX_EDGE_SHIFT, differenceInMonths(windowStart, minStart))
    return shift > 0 ? shiftWindow(chartWindow, -shift) : chartWindow
  }

  // Rightmost: shift forward up to 3 months (clamped to today)
  if (position === MONTHS_IN_WINDOW - 1) {
    const shift = Math.min(MAX_EDGE_SHIFT, differenceInMonths(today, windowEnd))
    return shift > 0 ? shiftWindow(chartWindow, shift) : chartWindow
  }

  // Outside window: position selected as last month (or nth if activation limits)
  const monthsFromActivation = differenceInMonths(selected, minStart)
  const targetPosition = Math.min(MONTHS_IN_WINDOW - 1, monthsFromActivation)
  const newStart = sub(selected, { months: targetPosition })
  return buildWindow(newStart < minStart ? minStart : newStart)
}

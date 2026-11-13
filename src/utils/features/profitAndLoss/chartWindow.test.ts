import { add, endOfMonth, startOfMonth, sub } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { areChartWindowsEqual, type ChartWindow, getChartWindow } from '@utils/features/profitAndLoss/chartWindow'

import { setupFakeSystemTime } from '@testUtils/dates/fakeSystemTime'
import { NOW } from '@testUtils/dates/fixedDates'

setupFakeSystemTime(NOW)

const buildWindow = (start: Date): ChartWindow => ({
  start: startOfMonth(start),
  end: endOfMonth(add(startOfMonth(start), { months: 11 })),
})

const FAR_PAST_ACTIVATION = new Date(2020, 0, 1)

// The window that ends on the current month, as produced for an established business
// that hasn't scrolled away from "now" — reused as a starting point across several cases.
const CURRENT_WINDOW = buildWindow(new Date(2025, 6, 1))

describe('getChartWindow', () => {
  it('always returns the trailing 12 months for a business less than 12 months old', () => {
    const recentActivation = new Date(2026, 0, 1)
    const unrelatedWindow = buildWindow(new Date(2021, 0, 1))

    expect(getChartWindow({
      chartWindow: unrelatedWindow,
      selectedDate: new Date(2021, 5, 1),
      activationDate: recentActivation,
    })).toEqual(CURRENT_WINDOW)
  })

  it('keeps the window unchanged when the selected month sits in the middle 10 months', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2025, 11, 20),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual(CURRENT_WINDOW)
  })

  it('shifts the window back the full 3 months when the leftmost month is selected and activation allows it', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2025, 6, 10),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual({
      start: startOfMonth(sub(CURRENT_WINDOW.start, { months: 3 })),
      end: endOfMonth(sub(CURRENT_WINDOW.end, { months: 3 })),
    })
  })

  it('clamps the leftward shift to the activation date when it is closer than 3 months', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2025, 6, 5),
      activationDate: new Date(2025, 5, 1),
    })).toEqual({
      start: startOfMonth(sub(CURRENT_WINDOW.start, { months: 1 })),
      end: endOfMonth(sub(CURRENT_WINDOW.end, { months: 1 })),
    })
  })

  it('does not shift left when the activation date is the same month as the window start', () => {
    const oldWindow = buildWindow(new Date(2024, 0, 1))

    expect(getChartWindow({
      chartWindow: oldWindow,
      selectedDate: new Date(2024, 0, 15),
      activationDate: new Date(2024, 0, 1),
    })).toEqual(oldWindow)
  })

  it('shifts the window forward the full 3 months when the rightmost month is selected and today allows it', () => {
    const oldWindow = buildWindow(new Date(2024, 0, 1))

    expect(getChartWindow({
      chartWindow: oldWindow,
      selectedDate: new Date(2024, 11, 10),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual({
      start: startOfMonth(add(oldWindow.start, { months: 3 })),
      end: endOfMonth(add(oldWindow.end, { months: 3 })),
    })
  })

  it('clamps the rightward shift to today when it is closer than 3 months', () => {
    const almostCurrentWindow = buildWindow(new Date(2025, 5, 1))

    expect(getChartWindow({
      chartWindow: almostCurrentWindow,
      selectedDate: new Date(2026, 4, 10),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual({
      start: startOfMonth(add(almostCurrentWindow.start, { months: 1 })),
      end: endOfMonth(add(almostCurrentWindow.end, { months: 1 })),
    })
  })

  it('does not shift right when the window already ends on the current month', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2026, 5, 10),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual(CURRENT_WINDOW)
  })

  it('rebuilds the window around a selected month that is entirely outside it', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2027, 0, 15),
      activationDate: FAR_PAST_ACTIVATION,
    })).toEqual(buildWindow(new Date(2026, 1, 1)))
  })

  it('clamps the rebuilt window to the activation date when the selected month is close to it', () => {
    expect(getChartWindow({
      chartWindow: CURRENT_WINDOW,
      selectedDate: new Date(2025, 1, 15),
      activationDate: new Date(2025, 0, 1),
    })).toEqual(buildWindow(new Date(2025, 0, 1)))
  })
})

describe('areChartWindowsEqual', () => {
  const windowA: ChartWindow = { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) }

  it('returns true for windows with matching start and end instants', () => {
    const windowB: ChartWindow = { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) }

    expect(areChartWindowsEqual(windowA, windowB)).toBe(true)
  })

  it('returns false when the start differs', () => {
    const windowB: ChartWindow = { start: new Date(2026, 0, 2), end: new Date(2026, 11, 31) }

    expect(areChartWindowsEqual(windowA, windowB)).toBe(false)
  })

  it('returns false when the end differs', () => {
    const windowB: ChartWindow = { start: new Date(2026, 0, 1), end: new Date(2026, 11, 30) }

    expect(areChartWindowsEqual(windowA, windowB)).toBe(false)
  })
})

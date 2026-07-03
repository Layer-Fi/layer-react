import { act, renderHook } from '@testing-library/react'
import { addMonths, endOfDay, endOfMonth, startOfMonth, startOfYear, subMonths } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createScopedDateStore, type CreateScopedDateStoreOptions } from '@providers/DateStoreProvider/internal/createScopedDateStore'
import { DatePreset } from '@components/DateSelection/utils'

const NOW = new Date(2026, 5, 15, 12, 0, 0)
const ONE_MONTH_BEFORE_NOW = subMonths(NOW, 1)
const THREE_MONTHS_BEFORE_NOW = subMonths(NOW, 3)
const FIVE_MONTHS_BEFORE_NOW = subMonths(NOW, 5)
const SIX_MONTHS_AFTER_NOW = addMonths(NOW, 6)

const END_OF_TODAY = endOfDay(NOW)

const CURRENT_MONTH_TO_DATE = {
  startDate: startOfMonth(NOW),
  endDate: END_OF_TODAY,
}

const CURRENT_YEAR_TO_DATE = {
  startDate: startOfYear(NOW),
  endDate: END_OF_TODAY,
}

const FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW = {
  startDate: startOfMonth(THREE_MONTHS_BEFORE_NOW),
  endDate: endOfMonth(THREE_MONTHS_BEFORE_NOW),
}

const MONTH_TO_DATE_OF_ONE_MONTH_BEFORE_NOW = {
  startDate: startOfMonth(ONE_MONTH_BEFORE_NOW),
  endDate: endOfDay(ONE_MONTH_BEFORE_NOW),
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

// Each test calls createScopedDateStore() so every test operates on isolated stores.
function setupDateStore(options?: CreateScopedDateStoreOptions) {
  const dateStore = createScopedDateStore(options)
  const { Provider, useDate, useDateActions, useDateRange, useDateRangeActions } = dateStore

  const { result } = renderHook(() => ({
    date: useDate(),
    fullRange: useDateRange({ dateSelectionMode: 'full' }),
    monthRange: useDateRange({ dateSelectionMode: 'month' }),
    dateActions: useDateActions(),
    rangeActions: useDateRangeActions(),
  }), { wrapper: Provider })

  return { dateStore, result }
}

describe('createScopedDateStore', () => {
  it('initializes to the current month by default', () => {
    const { result } = setupDateStore()

    expect(result.current.fullRange).toEqual(CURRENT_MONTH_TO_DATE)
  })

  it('initializes to year-to-date with the ThisYear preset', () => {
    const { result } = setupDateStore({ initialDatePreset: DatePreset.ThisYear })

    expect(result.current.fullRange).toEqual(CURRENT_YEAR_TO_DATE)
  })

  it('reflects setDateRange in the full range, clamping a future end date to today', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: FIVE_MONTHS_BEFORE_NOW,
        endDate: SIX_MONTHS_AFTER_NOW,
      })
    })

    expect(result.current.fullRange).toEqual({
      startDate: FIVE_MONTHS_BEFORE_NOW,
      endDate: END_OF_TODAY,
    })
  })

  it('projects the stored range onto the containing month in month mode', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW.startDate,
        endDate: THREE_MONTHS_BEFORE_NOW,
      })
    })

    expect(result.current.monthRange).toEqual(FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW)
  })

  it('anchors the start date to the start of the month when setting a single date', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.dateActions.setDate({ date: ONE_MONTH_BEFORE_NOW })
    })

    expect(result.current.fullRange).toEqual(MONTH_TO_DATE_OF_ONE_MONTH_BEFORE_NOW)
  })

  it('isolates state between two mounted providers of the same store', () => {
    const { dateStore, result: first } = setupDateStore()

    const { result: second } = renderHook(
      () => dateStore.useDateRange({ dateSelectionMode: 'full' }),
      { wrapper: dateStore.Provider },
    )

    act(() => {
      first.current.rangeActions.setDateRange(FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW)
    })

    expect(first.current.fullRange.startDate).toEqual(FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW.startDate)
    expect(second.current).toEqual(CURRENT_MONTH_TO_DATE)
  })

  it('throws a descriptive error when a hook is used outside its provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { useDateRange } = createScopedDateStore({ storeName: 'TestDateStore' })

    expect(() => renderHook(() => useDateRange({ dateSelectionMode: 'full' })))
      .toThrow('TestDateStore hooks must be used within TestDateStore.Provider')

    consoleError.mockRestore()
  })
})

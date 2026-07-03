import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DatePreset } from '@utils/date/dateRangePresets'
import { createScopedDateStore, type CreateScopedDateStoreOptions } from '@providers/DateStoreProvider/internal/createScopedDateStore'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'

const NOW = new Date(2026, 5, 15, 12, 0, 0)
const END_OF_TODAY = new Date(2026, 5, 15, 23, 59, 59, 999)

const ONE_MONTH_BEFORE_NOW = new Date(2026, 4, 15, 12, 0, 0)
const THREE_MONTHS_BEFORE_NOW = new Date(2026, 2, 15, 12, 0, 0)
const FIVE_MONTHS_BEFORE_NOW = new Date(2026, 0, 15, 12, 0, 0)
const SIX_MONTHS_AFTER_NOW = new Date(2026, 11, 15, 12, 0, 0)

const CURRENT_MONTH_TO_DATE = {
  startDate: new Date(2026, 5, 1),
  endDate: END_OF_TODAY,
}

const CURRENT_YEAR_TO_DATE = {
  startDate: new Date(2026, 0, 1),
  endDate: END_OF_TODAY,
}

const FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW = {
  startDate: new Date(2026, 2, 1),
  endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
}

const MONTH_TO_DATE_OF_ONE_MONTH_BEFORE_NOW = {
  startDate: new Date(2026, 4, 1),
  endDate: new Date(2026, 4, 15, 23, 59, 59, 999),
}

setupFakeSystemTime(NOW)

function setupDateStore(options?: CreateScopedDateStoreOptions) {
  const dateStore = createScopedDateStore(options)

  const {
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
  } = dateStore

  function useDateStoreTestState() {
    return {
      date: useDate(),
      fullRange: useDateRange({ dateSelectionMode: 'full' }),
      monthRange: useDateRange({ dateSelectionMode: 'month' }),
      dateActions: useDateActions(),
      rangeActions: useDateRangeActions(),
    }
  }

  const result = renderHook(useDateStoreTestState, { wrapper: Provider })

  return {
    dateStore,
    ...result,
  }
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
})

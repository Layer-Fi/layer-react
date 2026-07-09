import { type PropsWithChildren, type ReactElement } from 'react'
import { act, renderHook } from '@testing-library/react'
import { startOfDay } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { DatePreset } from '@utils/date/dateRangePresets'
import { createScopedDateStore, type CreateScopedDateStoreOptions } from '@providers/DateStoreProvider/internal/createScopedDateStore'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import {
  CURRENT_MONTH_TO_DATE,
  CURRENT_YEAR_TO_DATE,
  END_OF_TODAY,
  FIVE_MONTHS_BEFORE_NOW,
  FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW,
  MONTH_TO_DATE_OF_ONE_MONTH_BEFORE_NOW,
  NOW,
  ONE_MONTH_BEFORE_NOW,
  SIX_MONTHS_AFTER_NOW,
  THREE_MONTHS_BEFORE_NOW,
  TWO_YEARS_BEFORE_NOW,
} from '@test-utils/fixedDates'

setupFakeSystemTime(NOW)

/**
 * Minimal LayerContext wrapper exposing only what the date store resolver reads
 * (`business.activationAt`). Pass `activationAt: null` to simulate a business
 * that has not loaded yet.
 */
function makeBusinessWrapper(activationAt: Date | null) {
  const business = activationAt ? { activationAt } : undefined
  return function BusinessWrapper({ children }: PropsWithChildren) {
    return (
      <LayerContext.Provider value={{ business } as never}>
        {children}
      </LayerContext.Provider>
    )
  }
}

function setupDateStore(
  options?: CreateScopedDateStoreOptions,
  wrapper?: ({ children }: PropsWithChildren) => ReactElement,
) {
  const dateStore = createScopedDateStore(options)

  const {
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    usePreset,
  } = dateStore

  function useDateStoreTestState() {
    return {
      date: useDate(),
      preset: usePreset(),
      fullRange: useDateRange({ dateSelectionMode: 'full' }),
      monthRange: useDateRange({ dateSelectionMode: 'month' }),
      dateActions: useDateActions(),
      rangeActions: useDateRangeActions(),
    }
  }

  const Wrapper = wrapper
    ? ({ children }: PropsWithChildren) => wrapper({ children: <Provider>{children}</Provider> })
    : Provider

  const result = renderHook(useDateStoreTestState, { wrapper: Wrapper })

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
        startDate: THREE_MONTHS_BEFORE_NOW,
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

  it('tracks the configured preset and resets it to Custom on a direct range change', () => {
    const { result } = setupDateStore({ initialDatePreset: DatePreset.ThisYear })

    expect(result.current.preset).toBe(DatePreset.ThisYear)

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: FIVE_MONTHS_BEFORE_NOW,
        endDate: THREE_MONTHS_BEFORE_NOW,
      })
    })

    expect(result.current.preset).toBe(DatePreset.Custom)
  })

  it('records the preset when setting a preset range', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.rangeActions.setPresetRange({
        preset: DatePreset.LastMonth,
        startDate: ONE_MONTH_BEFORE_NOW,
        endDate: ONE_MONTH_BEFORE_NOW,
      })
    })

    expect(result.current.preset).toBe(DatePreset.LastMonth)
  })

  describe('AllTime preset', () => {
    it('resolves the range from the business activation date to the present', () => {
      const { result } = setupDateStore(
        { initialDatePreset: DatePreset.AllTime },
        makeBusinessWrapper(TWO_YEARS_BEFORE_NOW),
      )

      expect(result.current.preset).toBe(DatePreset.AllTime)
      expect(result.current.fullRange).toEqual({
        startDate: startOfDay(TWO_YEARS_BEFORE_NOW),
        endDate: END_OF_TODAY,
      })
    })

    it('renders the fallback (does not mount the store) while the business is loading', () => {
      const { result } = setupDateStore(
        { initialDatePreset: DatePreset.AllTime },
        makeBusinessWrapper(null),
      )

      // The store never mounts, so the consuming hook never runs.
      expect(result.current).toBeNull()
    })
  })
})

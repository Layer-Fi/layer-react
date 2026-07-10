import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DatePreset, rangeForAllTime } from '@utils/date/dateRangePresets'
import { createScopedDateStore, type CreateScopedDateStoreOptions } from '@providers/DateStoreProvider/internal/createScopedDateStore'

import { makeBusiness } from '@fixtures/business/mocks'
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
} from '@test-utils/fixedDates'
import { LayerTestProvider } from '@test-utils/LayerTestProvider'

function setupDateStore(options?: CreateScopedDateStoreOptions) {
  const dateStore = createScopedDateStore(options)

  const {
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    useDatePreset,
    useDatePresetActions,
  } = dateStore

  function useDateStoreTestState() {
    return {
      date: useDate(),
      fullRange: useDateRange({ dateSelectionMode: 'full' }),
      monthRange: useDateRange({ dateSelectionMode: 'month' }),
      datePreset: useDatePreset(),
      dateActions: useDateActions(),
      rangeActions: useDateRangeActions(),
      datePresetActions: useDatePresetActions(),
    }
  }

  const result = renderHook(useDateStoreTestState, { wrapper: Provider })

  return {
    dateStore,
    ...result,
  }
}

describe('createScopedDateStore', () => {
  // Relative presets resolve synchronously from `now`, so pin the clock.
  setupFakeSystemTime(NOW)

  it('initializes to the current month by default', () => {
    const { result } = setupDateStore()

    expect(result.current.fullRange).toEqual(CURRENT_MONTH_TO_DATE)
    expect(result.current.datePreset).toBe(DatePreset.ThisMonth)
  })

  it('initializes to year-to-date with the ThisYear preset', () => {
    const { result } = setupDateStore({ initialDatePreset: DatePreset.ThisYear })

    expect(result.current.fullRange).toEqual(CURRENT_YEAR_TO_DATE)
    expect(result.current.datePreset).toBe(DatePreset.ThisYear)
  })

  it('reflects setDateRange in the full range, clamping a future end date to today and deriving Custom', () => {
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
    expect(result.current.datePreset).toBe(DatePreset.Custom)
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

    expect(result.current.datePreset).toBe(DatePreset.ThisYear)

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: FIVE_MONTHS_BEFORE_NOW,
        endDate: THREE_MONTHS_BEFORE_NOW,
      })
    })

    expect(result.current.datePreset).toBe(DatePreset.Custom)
  })

  it('resolves the range and sets the preset when selecting a preset', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.datePresetActions.setDatePreset(DatePreset.LastMonth)
    })

    expect(result.current.datePreset).toBe(DatePreset.LastMonth)
    // Range resolved to the start of last month (NOW is 2026-06-15).
    expect(result.current.fullRange.startDate).toEqual(new Date(2026, 4, 1))
  })

  it('re-derives a named preset when an explicit range matches it (This Year)', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: new Date(2026, 0, 1),
        endDate: NOW,
      })
    })

    expect(result.current.datePreset).toBe(DatePreset.ThisYear)
  })

  it('renders the fallback (does not mount the store) when no business context is available', () => {
    // AllTime needs the business activation date; without a business context the
    // resolver stays in its loading state and the store is never constructed.
    const { result } = setupDateStore({ initialDatePreset: DatePreset.AllTime })

    expect(result.current).toBeNull()
  })
})

describe('createScopedDateStore AllTime preset', () => {
  it('defers construction until the business loads, then resolves the range from the activation date', async () => {
    const dateStore = createScopedDateStore({ initialDatePreset: DatePreset.AllTime })

    function Wrapper({ children }: PropsWithChildren) {
      return (
        <LayerTestProvider>
          <dateStore.Provider>{children}</dateStore.Provider>
        </LayerTestProvider>
      )
    }

    const { result } = renderHook(
      () => ({
        range: dateStore.useDateRange({ dateSelectionMode: 'full' }),
        datePreset: dateStore.useDatePreset(),
      }),
      { wrapper: Wrapper },
    )

    // Fallback while the business (and thus the activation date) is still loading.
    expect(result.current).toBeNull()

    await waitFor(() => expect(result.current).not.toBeNull())

    expect(result.current.datePreset).toBe(DatePreset.AllTime)
    expect(result.current.range).toEqual(rangeForAllTime(makeBusiness().activationAt))
  })
})

import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { startOfDay } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'

import { DatePreset } from '@utils/date/dateRangePresets'
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
  PREVIOUS_MONTH_RANGE,
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

  it('clamps the end date to today for an inverted range with a future start (no future end reintroduced)', () => {
    const { result } = setupDateStore()

    // Assert the stored range (the setter's return), not the projected read —
    // reads re-clamp on the way out and would mask a bad stored end date.
    let stored: { startDate: Date, endDate: Date, preset: DatePreset } | undefined
    act(() => {
      stored = result.current.rangeActions.setDateRange({
        startDate: SIX_MONTHS_AFTER_NOW,
        endDate: THREE_MONTHS_BEFORE_NOW,
      })
    })

    expect(stored).toEqual({
      startDate: THREE_MONTHS_BEFORE_NOW,
      endDate: END_OF_TODAY,
      preset: DatePreset.Custom,
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
      result.current.datePresetActions.setDatePreset({ datePreset: DatePreset.LastMonth })
    })

    expect(result.current.datePreset).toBe(DatePreset.LastMonth)
    expect(result.current.fullRange).toEqual(PREVIOUS_MONTH_RANGE)
  })

  it('re-derives a named preset when an explicit range matches it (This Year)', () => {
    const { result } = setupDateStore()

    act(() => {
      result.current.rangeActions.setDateRange({
        startDate: CURRENT_YEAR_TO_DATE.startDate,
        endDate: NOW,
      })
    })

    expect(result.current.datePreset).toBe(DatePreset.ThisYear)
  })

  it('throws when an AllTime store is mounted with no business context', () => {
    // AllTime can never resolve without a business context, so fail loudly rather
    // than hang on the fallback. (A present-but-loading business defers instead.)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => setupDateStore({ initialDatePreset: DatePreset.AllTime }))
      .toThrow('An AllTime date store must be mounted within a business context')

    consoleError.mockRestore()
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

    // While the business (activation date) loads, the Provider renders its
    // fallback and does not render children, so the hook never runs. renderHook's
    // `result` is a React.createRef() whose `current` starts as `null`, so it
    // stays `null` (not `undefined`) until the store mounts.
    expect(result.current).toBeNull()

    await waitFor(() => expect(result.current).not.toBeNull())

    expect(result.current.datePreset).toBe(DatePreset.AllTime)
    expect(result.current.range.startDate).toEqual(startOfDay(makeBusiness().activationAt))
  })
})

import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LayerContextDateRangeBridge } from '@providers/BusinessProvider/LayerContextDateRangeBridge'
import { GlobalDateStoreProvider } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { LayerContext, useLayerContext } from '@contexts/LayerContext/LayerContext'

import { setupFakeSystemTime } from '@test-utils/fakeSystemTime'
import { CURRENT_MONTH_TO_DATE, FIVE_MONTHS_BEFORE_NOW, NOW, THREE_MONTHS_BEFORE_NOW } from '@test-utils/fixedDates'

setupFakeSystemTime(NOW)

// Mirrors the post-reorder tree: business context above the store, the bridge
// below it re-injecting `dateRange` onto the context.
function Wrapper({ children }: PropsWithChildren) {
  return (
    <LayerContext.Provider value={{} as never}>
      <GlobalDateStoreProvider>
        <LayerContextDateRangeBridge>
          {children}
        </LayerContextDateRangeBridge>
      </GlobalDateStoreProvider>
    </LayerContext.Provider>
  )
}

describe('LayerContextDateRangeBridge', () => {
  it('exposes the store-backed date range through useLayerContext (public API)', () => {
    const { result } = renderHook(() => useLayerContext().dateRange, { wrapper: Wrapper })

    expect(result.current.range).toEqual(CURRENT_MONTH_TO_DATE)
  })

  it('drives the store through the context setRange', () => {
    const { result } = renderHook(() => useLayerContext().dateRange, { wrapper: Wrapper })

    act(() => {
      result.current.setRange({ startDate: FIVE_MONTHS_BEFORE_NOW, endDate: THREE_MONTHS_BEFORE_NOW })
    })

    expect(result.current.range.startDate).toEqual(FIVE_MONTHS_BEFORE_NOW)
  })
})

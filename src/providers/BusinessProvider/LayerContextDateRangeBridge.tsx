import { type PropsWithChildren, useContext, useMemo } from 'react'

import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

/**
 * Re-injects the global date range onto `LayerContext` from *below* the date
 * store.
 *
 * After the provider reorder (`BusinessProvider` now wraps
 * `GlobalDateStoreProvider`), the base `LayerContext` value is provided above the
 * store and therefore cannot read it. The store's resolver reads the business
 * from that base context; this bridge — mounted below the store — reads the store
 * and re-provides the context with a live `dateRange`, keeping the public
 * `useLayerContext().dateRange` API working for embedding applications.
 *
 * There is no circular dependency: business flows down from the base context into
 * the store's resolver, and the resolved range flows back onto the context only
 * here, below the store.
 */
export function LayerContextDateRangeBridge({ children }: PropsWithChildren) {
  const base = useContext(LayerContext)

  const range = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  if (!base) {
    throw new Error('LayerContextDateRangeBridge must be rendered within LayerContext.Provider')
  }

  const value = useMemo(
    () => ({ ...base, dateRange: { range, setRange: setDateRange } }),
    [base, range, setDateRange],
  )

  return (
    <LayerContext.Provider value={value}>
      {children}
    </LayerContext.Provider>
  )
}

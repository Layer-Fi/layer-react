import { useContext } from 'react'

import { getActivationDate } from '@utils/business'
import type { DateRange } from '@utils/date/dateRange'
import { deriveDateRangeFromPreset, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

export type ResolvedInitialRange =
  | { status: 'ready', range: DateRange }
  | { status: 'loading' }

/**
 * Reads the business activation date without throwing when there is no
 * `LayerContext` above (e.g. the global store is mounted above `BusinessProvider`).
 * Returns `undefined` while the business is still loading or unavailable.
 *
 * Also used by the action hooks to resolve/derive presets at mutation time.
 */
export function useBusinessActivationDateSafe(): Date | undefined {
  const ctx = useContext(LayerContext)
  return ctx ? getActivationDate(ctx.business) : undefined
}

/**
 * Resolves a preset to a concrete initial range. Relative presets resolve
 * synchronously from `now`. Context-dependent presets (`AllTime`) resolve only
 * once the business activation date is available — until then they report
 * `loading`, so the store can be constructed *born-correct* rather than seeded
 * with a wrong value and patched later.
 */
export function useDerivedInitialDateRange(preset: SelectableDatePreset): ResolvedInitialRange {
  const ctx = useContext(LayerContext)
  const activationDate = ctx ? getActivationDate(ctx.business) : undefined
  const range = deriveDateRangeFromPreset(preset, activationDate)

  if (range) {
    return { status: 'ready', range }
  }

  // `range` is null only for `AllTime` with no activation date. No `LayerContext`
  // at all means the store is mounted outside a business context (e.g. an AllTime
  // store above `BusinessProvider`), where it can never resolve — fail loudly
  // instead of hanging on the fallback forever. A present-but-still-loading
  // business is the normal deferral case and reports `loading`.
  if (ctx === undefined) {
    throw new Error(
      'An AllTime date store must be mounted within a business context (below BusinessProvider).',
    )
  }

  return { status: 'loading' }
}

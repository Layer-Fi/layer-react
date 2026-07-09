import { useContext } from 'react'

import { getActivationDate } from '@utils/business'
import type { DateRange } from '@utils/date/dateRange'
import { DatePreset, rangeForAllTime, rangeForPreset } from '@utils/date/dateRangePresets'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

export type ResolvedInitialRange =
  | { status: 'ready', range: DateRange }
  | { status: 'loading' }

/**
 * Reads the business activation date without throwing when there is no
 * `LayerContext` above (e.g. the global store is mounted above `BusinessProvider`).
 * Returns `undefined` while the business is still loading or unavailable.
 */
function useBusinessActivationDateSafe(): Date | undefined {
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
export function useResolvedInitialRange(preset: Exclude<DatePreset, DatePreset.Custom>): ResolvedInitialRange {
  const activationDate = useBusinessActivationDateSafe()

  if (preset === DatePreset.AllTime) {
    if (activationDate == null) {
      return { status: 'loading' }
    }

    return { status: 'ready', range: rangeForAllTime(activationDate) }
  }

  return { status: 'ready', range: rangeForPreset(preset) }
}

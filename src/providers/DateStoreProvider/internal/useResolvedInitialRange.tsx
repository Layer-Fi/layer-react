import { useContext } from 'react'

import { getActivationDate } from '@utils/business'
import type { DateRange } from '@utils/date/dateRange'
import { deriveDateRangeFromPreset, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

export type ResolvedInitialRange =
  | { status: 'ready', range: DateRange }
  | { status: 'loading' }

export function useBusinessActivationDateSafe(): Date | undefined {
  const ctx = useContext(LayerContext)
  return ctx ? getActivationDate(ctx.business) : undefined
}

export function useDerivedInitialDateRange(preset: SelectableDatePreset): ResolvedInitialRange {
  const ctx = useContext(LayerContext)
  const activationDate = ctx ? getActivationDate(ctx.business) : undefined
  const range = deriveDateRangeFromPreset(preset, activationDate)

  if (range) {
    return { status: 'ready', range }
  }

  if (ctx === undefined) {
    throw new Error(
      'An AllTime date store must be mounted within a business context (below BusinessProvider).',
    )
  }

  return { status: 'loading' }
}

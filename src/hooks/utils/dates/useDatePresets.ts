import { useMemo } from 'react'

import {
  ALL_TIME_MIN_DATE,
  type DatePreset,
  type DateRange,
  findMatchingPresetForDateRange,
  rangeForSelectablePreset,
  type SelectableDatePreset,
} from '@utils/date/dateRange'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'

/**
 * Contextual wrapper around the pure date-preset helpers. This is the single
 * place that sources "now" and the business activation date from context.
 */
export function useDatePresets() {
  const activationDate = useBusinessActivationDate() ?? ALL_TIME_MIN_DATE

  return useMemo(() => {
    // A single "now" per activation change keeps derived ranges stable across
    // renders. If the app later exposes "now" from a provider, read it here.
    const context = { now: new Date(), activationDate }

    return {
      ...context,
      rangeForSelectablePreset: (selectedPreset: SelectableDatePreset) =>
        rangeForSelectablePreset(selectedPreset, context),
      findMatchingPresetForDateRange: (
        dateRange: DateRange,
        currentPreset: DatePreset | null = null,
      ) => findMatchingPresetForDateRange(dateRange, context, currentPreset),
    }
  }, [activationDate])
}

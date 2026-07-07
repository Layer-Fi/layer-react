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

  return useMemo(() => ({
    activationDate,
    rangeForSelectablePreset: (selectedPreset: SelectableDatePreset) =>
      rangeForSelectablePreset(selectedPreset, { now: new Date(), activationDate }),
    findMatchingPresetForDateRange: (
      dateRange: DateRange,
      currentPreset: DatePreset | null = null,
    ) => findMatchingPresetForDateRange(dateRange, { now: new Date(), activationDate }, currentPreset),
  }), [activationDate])
}

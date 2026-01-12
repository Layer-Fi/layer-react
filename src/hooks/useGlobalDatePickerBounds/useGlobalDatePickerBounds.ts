import { useMemo } from 'react'
import { endOfDay, startOfDay } from 'date-fns'

import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'

export function useGlobalDatePickerBounds(): { minDate: Date | null, maxDate: Date } {
  const rawActivationDate = useBusinessActivationDate()

  const minDate = useMemo(() => rawActivationDate ? startOfDay(rawActivationDate) : null, [rawActivationDate])

  const maxDate = useMemo(() => endOfDay(new Date()), [])

  return useMemo(() => ({ minDate, maxDate }), [minDate, maxDate])
}

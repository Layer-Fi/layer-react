import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useGlobalDatePickerBounds } from '@hooks/useGlobalDatePickerBounds/useGlobalDatePickerBounds'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { YearPicker } from '@components/YearPicker/YearPicker'

export const GlobalYearPicker = () => {
  const { minDate, maxDate } = useGlobalDatePickerBounds()
  const { setYear } = useGlobalDateRangeActions()
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })

  const selectedYear = getYear(startDate)

  const minDateZdt = useMemo(() => minDate ? convertDateToZonedDateTime(minDate) : null, [minDate])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(maxDate), [maxDate])

  const onChange = useCallback((year: number) => {
    setYear({ startDate: new Date(year, 0, 1) })
  }, [setYear])

  return (
    <YearPicker
      year={selectedYear}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
    />
  )
}

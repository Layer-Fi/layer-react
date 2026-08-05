import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'

import { convertDateToZonedDateTime } from '@utils/shared/time/timeUtils'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { YearPicker } from '@ui/DatePickers/YearPicker/YearPicker'
import { useBusinessDatePickerBounds } from '@blocks/DatePickers/useBusinessDatePickerBounds'

type GlobalYearPickerProps = {
  showLabel?: boolean
}

export const GlobalYearPicker = ({ showLabel = false }: GlobalYearPickerProps) => {
  const { minDate, maxDate } = useBusinessDatePickerBounds()
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
      showLabel={showLabel}
      year={selectedYear}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
    />
  )
}

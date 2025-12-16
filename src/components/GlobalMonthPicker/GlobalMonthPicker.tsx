import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useGlobalDatePickerBounds } from '@hooks/useGlobalDatePickerBounds/useGlobalDatePickerBounds'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'

export const GlobalMonthPicker = ({ truncateMonth }: { truncateMonth?: boolean }) => {
  const { minDate, maxDate } = useGlobalDatePickerBounds()
  const { setMonth } = useGlobalDateRangeActions()
  const { date } = useGlobalDate({ dateSelectionMode: 'month' })

  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => minDate ? convertDateToZonedDateTime(minDate) : null, [minDate])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(maxDate), [maxDate])

  const onChange = useCallback((val: ZonedDateTime) => {
    setMonth({ startDate: val.toDate() })
  }, [setMonth])

  return (
    <MonthPicker
      label='Select a month'
      showLabel={false}
      date={dateZdt}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
      truncateMonth={truncateMonth}
    />
  )
}

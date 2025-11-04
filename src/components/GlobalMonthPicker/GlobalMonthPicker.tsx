import { useCallback, useMemo } from 'react'
import { endOfToday } from 'date-fns'
import { useGlobalDate, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { convertDateToZonedDateTime } from '../../utils/time/timeUtils'
import { useBusinessActivationDate } from '../../hooks/business/useBusinessActivationDate'
import { MonthPicker } from '../MonthPicker/MonthPicker'
import { type ZonedDateTime } from '@internationalized/date'

export const GlobalMonthPicker = () => {
  const activationDate = useBusinessActivationDate()
  const today = useMemo(() => endOfToday(), [])

  const { setMonth } = useGlobalDateRangeActions()
  const { date } = useGlobalDate()

  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => activationDate ? convertDateToZonedDateTime(activationDate) : null, [activationDate])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(today), [today])

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
    />
  )
}

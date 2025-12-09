import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { endOfToday, startOfDay } from 'date-fns'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'

export const GlobalMonthPicker = ({ truncateMonth }: { truncateMonth?: boolean }) => {
  const rawActivationDate = useBusinessActivationDate()
  const activationDate = useMemo(() => rawActivationDate ? startOfDay(rawActivationDate) : null, [rawActivationDate])

  const { setMonth } = useGlobalDateRangeActions()
  const { date } = useGlobalDate()

  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => activationDate ? convertDateToZonedDateTime(activationDate) : null, [activationDate])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(endOfToday()), [])

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

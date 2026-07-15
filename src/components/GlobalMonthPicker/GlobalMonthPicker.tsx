import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { useTranslation } from 'react-i18next'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessDatePickerBounds } from '@hooks/utils/dates/useBusinessDatePickerBounds'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'

type GlobalMonthPickerProps = {
  truncateMonth?: boolean
  showLabel?: boolean
}

export const GlobalMonthPicker = ({ truncateMonth, showLabel = false }: GlobalMonthPickerProps) => {
  const { t } = useTranslation()
  const { minDate, maxDate } = useBusinessDatePickerBounds()
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
      label={t('date:label.month', 'Month')}
      showLabel={showLabel}
      date={dateZdt}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
      truncateMonth={truncateMonth}
    />
  )
}

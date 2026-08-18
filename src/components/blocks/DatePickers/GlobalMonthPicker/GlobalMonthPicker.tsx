import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { useTranslation } from 'react-i18next'

import { convertDateToZonedDateTime } from '@utils/shared/time/timeUtils'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { withUsageTracking } from '@components/utility/withUsageTracking'
import { MonthPicker } from '@ui/DatePickers/MonthPicker/MonthPicker'
import { useBusinessDatePickerBounds } from '@blocks/DatePickers/useBusinessDatePickerBounds'

export type GlobalMonthPickerProps = {
  truncateMonth?: boolean
  showLabel?: boolean
}

const GlobalMonthPickerComponent = ({ truncateMonth, showLabel = false }: GlobalMonthPickerProps) => {
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

export const GlobalMonthPicker = withUsageTracking('GlobalMonthPicker', GlobalMonthPickerComponent)

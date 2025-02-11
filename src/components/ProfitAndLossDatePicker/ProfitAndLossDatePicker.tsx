import { useContext } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useDate } from '../../hooks/useDate'
import { endOfDay, endOfMonth, startOfMonth } from 'date-fns'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector, DEFAULT_ALLOWED_PICKER_MODES } from '../DatePicker/ModeSelector/DatePickerModeSelector'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  customDateRanges,
  allowedDatePickerModes,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()
  const { refetch } = useContext(ProfitAndLoss.ComparisonContext)

  /** @TODO - try to read from global state first if not set.
   * Also, it may require to have context-provider to encapsulate all subcomponents */
  const { date, setDate } = useDate({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  })

  // useEffect(() => {
  //   refetch({
  //     startDate: date.startDate,
  //     endDate: date.endDate,
  //   })
  // }, [date.startDate, date.endDate, refetch])

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      defaultSelected={[date.startDate, date.endDate]}
      onChange={(dates) => {
        if (dates instanceof Date) {
          setDate({ startDate: dates, endDate: endOfDay(dates) })

          return
        }

        const [start, end] = dates

        setDate({ startDate: start, endDate: end ?? endOfDay(start) })
      }}
      displayMode={date.mode}
      allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
      onChangeMode={(rangeDisplayMode) => {
        if (rangeDisplayMode !== 'dayPicker') {
          setDate({ mode: rangeDisplayMode })
        }
      }}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
      customDateRanges={customDateRanges}
      minDate={minDate}
    />
  )
}

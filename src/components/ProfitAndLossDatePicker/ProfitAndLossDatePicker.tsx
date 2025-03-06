import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { endOfDay } from 'date-fns'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { useDateRange } from '../../hooks/useDateRange'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  customDateRanges,
  allowedDatePickerModes,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()

  const { date, setDate } = useDateRange({})

  console.log('date', date)

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      defaultSelected={[date.startDate, date.endDate]}
      onChange={(dates) => {
        if (dates instanceof Date) {
          setDate({ startDate: dates, endDate: endOfDay(dates), mode: date.mode })

          return
        }

        const [start, end] = dates

        setDate({ startDate: start, endDate: end ?? endOfDay(start), mode: date.mode })
      }}
      displayMode={date.mode}
      allowedModes={allowedDatePickerModes}
      onChangeMode={(rangeDisplayMode) => {
        if (rangeDisplayMode !== 'dayPicker') {
          console.log('onmodechange', date)
          setDate({ ...date, mode: rangeDisplayMode })
        }
      }}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
      customDateRanges={customDateRanges}
      minDate={minDate}
      syncWithGlobalDate={true}
    />
  )
}

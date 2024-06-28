import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { TextButton } from '../Button'
import classNames from 'classnames'
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from 'date-fns'

export const DateRangeInput = ({
  selected,
  onChange,
  ...props
}: {
  selected?: Date[]
  onChange?: (dates: [Date | null, Date | null]) => void
  dateFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
}) => {
  const [selectedDate, setSelectedDate] = useState<[Date | null, Date | null]>(
    selected ? [selected[0], selected[1]] : [null, null],
  )

  useEffect(() => {
    if (onChange) {
      onChange(selectedDate)
    }
  }, [selectedDate])

  const wrapperClassName = classNames('Layer__datepicker')

  return (
    <DatePicker
      wrapperClassName={wrapperClassName}
      startDate={selectedDate[0]}
      endDate={selectedDate[1]}
      selected={selectedDate[0]}
      onChange={(dates: [Date | null, Date | null]) => setSelectedDate(dates)}
      calendarClassName='Layer__datepicker__calendar'
      popperClassName='Layer__datepicker__popper'
      formatWeekDay={nameOfDay => nameOfDay.slice(0, 1)}
      selectsRange={true}
      renderDayContents={(day, date) => <div>{day}</div>}
      {...props}
    >
      <div className='Layer__datepicker__popper__custom-footer'>
        <TextButton
          onClick={() =>
            setSelectedDate([startOfMonth(new Date()), endOfMonth(new Date())])
          }
        >
          This month
        </TextButton>
        <TextButton
          onClick={() =>
            setSelectedDate([
              startOfMonth(subMonths(new Date(), 1)),
              endOfMonth(subMonths(new Date(), 1)),
            ])
          }
        >
          Last month
        </TextButton>
        <TextButton
          onClick={() =>
            setSelectedDate([
              startOfQuarter(new Date()),
              endOfQuarter(new Date()),
            ])
          }
        >
          This quarter
        </TextButton>
        <TextButton
          onClick={() =>
            setSelectedDate([startOfYear(new Date()), endOfYear(new Date())])
          }
        >
          This year
        </TextButton>
      </div>
    </DatePicker>
  )
}

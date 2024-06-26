import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import classNames from 'classnames'

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
    if (onChange && selectedDate) {
      onChange(selectedDate)
    }
  }, [selectedDate, onChange])

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
      {...props}
    />
  )
}

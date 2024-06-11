import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import classNames from 'classnames'

export const DateInput = ({
  selected,
  onChange,
  ...props
}: {
  selected?: string
  onChange?: (date: string) => void
  dateFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
  showTimeSelect?: boolean
  showTimeSelectOnly?: boolean
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    selected ? new Date(selected) : new Date(),
  )

  useEffect(() => {
    if (onChange && selectedDate) {
      onChange(selectedDate.toISOString())
    }
  }, [selectedDate])

  const wrapperClassName = classNames(
    'Layer__datepicker',
    props.showTimeSelect && 'Layer__datepicker__time',
  )
  return (
    <DatePicker
      wrapperClassName={wrapperClassName}
      selected={selected ? new Date(selected) : selectedDate}
      onChange={date => setSelectedDate(date)}
      calendarClassName='Layer__datepicker__calendar'
      popperClassName='Layer__datepicker__popper'
      calendarIconClassname='Layer__datepicker__calendar-icon'
      formatWeekDay={nameOfDay => nameOfDay.slice(0, 1)}
      {...props}
    />
  )
}

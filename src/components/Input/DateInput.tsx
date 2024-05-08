import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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

  return (
    <DatePicker
      wrapperClassName='Layer__date-picker'
      selected={selected ? new Date(selected) : selectedDate}
      onChange={date => setSelectedDate(date)}
      calendarClassName='Layer__date-picker__calendar'
      popperClassName='Layer__date-picker__popper'
      calendarIconClassname='Layer__date-picker__calendar-icon'
      {...props}
    />
  )
}

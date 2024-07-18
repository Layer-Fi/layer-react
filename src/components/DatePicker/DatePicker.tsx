import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button, ButtonVariant } from '../Button'
import { DatePickerOptions } from './DatePickerOptions'
import classNames from 'classnames'

interface DatePickerProps {
  mode:
    | 'dayPicker'
    | 'dayRangePicker'
    | 'monthPicker'
    | 'monthRangePicker'
    | 'timePicker'
  selected: Date | [Date | null, Date | null]
  onChange: (date: Date | [Date, Date | null]) => void
  dateFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
  options?: string[]
  wrapperClassName?: string
  calendarClassName?: string
  popperClassName?: string
  currentDateOption?: boolean
  minDate?: Date
}

export const DatePicker = ({
  selected,
  onChange,
  mode = 'dayPicker',
  dateFormat = mode === 'monthPicker' || mode === 'monthRangePicker'
    ? 'MMMM, yyyy'
    : mode === 'timePicker'
    ? 'h:mm aa'
    : 'MMMM d, yyyy',
  timeIntervals = 15,
  timeCaption,
  placeholderText,
  options = [],
  wrapperClassName,
  calendarClassName,
  popperClassName,
  minDate,
  currentDateOption = true,
  ...props
}: DatePickerProps) => {
  const [updatePickerDate, setPickerDate] = useState<boolean>(false)
  const [selectedDates, setSelectedDates] = useState<
    Date | [Date | null, Date | null] | null
  >(selected)

  useEffect(() => {
    setPickerDate(true)
    if (selected !== selectedDates) {
      setSelectedDates(selected)
    }
  }, [selected])

  useEffect(() => {
    if (onChange && !updatePickerDate) {
      onChange(selectedDates as Date | [Date, Date])
    } else {
      setPickerDate(false)
    }
  }, [selectedDates])

  const wrapperClassNames = classNames(
    'Layer__datepicker__wrapper',
    mode === 'timePicker' && 'Layer__datepicker__time__wrapper',
  )

  const datePickerWrapperClassNames = classNames(
    'Layer__datepicker',
    mode === 'timePicker' && 'Layer__datepicker__time',
    wrapperClassName,
  )
  const calendarClassNames = classNames(
    'Layer__datepicker__calendar',
    calendarClassName,
  )
  const popperClassNames = classNames(
    'Layer__datepicker__popper',
    popperClassName,
  )

  const handleDateChange = (date: Date | [Date | null, Date | null]) => {
    setSelectedDates(date)
  }

  const isCurrentDate = () => {
    const currentDate = new Date()
    if (mode === 'dayPicker') {
      return (
        selectedDates instanceof Date &&
        selectedDates.toDateString() === currentDate.toDateString()
      )
    } else if (mode === 'monthPicker') {
      return (
        selectedDates instanceof Date &&
        selectedDates.getMonth() === currentDate.getMonth() &&
        selectedDates.getFullYear() === currentDate.getFullYear()
      )
    }
    return false
  }

  const setCurrentDate = () => {
    const currentDate = new Date()
    if (mode === 'dayPicker') {
      setSelectedDates(currentDate)
    } else if (mode === 'monthPicker') {
      setSelectedDates(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      )
    }
  }

  return (
    <div className={wrapperClassNames}>
      <ReactDatePicker
        wrapperClassName={datePickerWrapperClassNames}
        startDate={
          mode === 'dayRangePicker' || mode === 'monthRangePicker'
            ? (selectedDates as [Date | null, Date | null])[0]
            : undefined
        }
        endDate={
          mode === 'dayRangePicker' || mode === 'monthRangePicker'
            ? (selectedDates as [Date | null, Date | null])[1]
            : undefined
        }
        selected={
          mode !== 'dayRangePicker' && mode !== 'monthRangePicker'
            ? (selectedDates as Date)
            : undefined
        }
        onChange={handleDateChange}
        calendarClassName={calendarClassNames}
        popperClassName={popperClassNames}
        enableTabLoop={false}
        popperPlacement='bottom-start'
        selectsRange={mode === 'dayRangePicker' || mode === 'monthRangePicker'}
        showMonthYearPicker={
          mode === 'monthPicker' || mode === 'monthRangePicker'
        }
        dateFormat={dateFormat}
        renderDayContents={day => (
          <span className='Layer__datepicker__day-contents'>{day}</span>
        )}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        showTimeSelect={mode === 'timePicker'}
        showTimeSelectOnly={mode === 'timePicker'}
        minDate={minDate}
        {...props}
      >
        {mode === 'dayRangePicker' && (
          <DatePickerOptions
            options={options}
            setSelectedDate={setSelectedDates}
          />
        )}
      </ReactDatePicker>
      {currentDateOption &&
        (mode === 'dayPicker' || mode === 'monthPicker') && (
          <Button
            className='Layer__datepicker__current-button'
            onClick={setCurrentDate}
            variant={ButtonVariant.secondary}
            disabled={isCurrentDate()}
          >
            {mode === 'dayPicker' ? 'Today' : 'Current'}
          </Button>
        )}
    </div>
  )
}

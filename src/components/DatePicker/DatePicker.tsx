import React, { useEffect, useRef, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useSizeClass } from '../../hooks/useWindowSize'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
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
  maxDate?: Date
  navigateArrows?: boolean
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
  maxDate,
  currentDateOption = true,
  navigateArrows = mode === 'monthPicker',
  ...props
}: DatePickerProps) => {
  const { isMobile, isDesktop } = useSizeClass()
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
    navigateArrows && 'Layer__datepicker__wrapper--arrows',
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

  const isTodayOrAfter = Boolean(
    selectedDates instanceof Date && selectedDates >= new Date(),
  )

  const isBeforeMinDate = Boolean(
    minDate && selectedDates instanceof Date && selectedDates <= minDate,
  )

  const changeDate = (value: number) => {
    if (mode === 'dayPicker') {
      setSelectedDates(
        new Date(
          (selectedDates as Date).setDate(
            (selectedDates as Date).getDate() + value,
          ),
        ),
      )
    } else if (mode === 'monthPicker') {
      setSelectedDates(
        new Date(
          (selectedDates as Date).setMonth(
            (selectedDates as Date).getMonth() + value,
          ),
        ),
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
        dateFormat={
          (isMobile && mode === 'monthPicker') || mode === 'monthRangePicker'
            ? 'MMM, yyyy'
            : dateFormat
        }
        renderDayContents={day => (
          <span className='Layer__datepicker__day-contents'>{day}</span>
        )}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        showTimeSelect={mode === 'timePicker'}
        showTimeSelectOnly={mode === 'timePicker'}
        minDate={minDate}
        maxDate={maxDate}
        withPortal={!isDesktop}
        onCalendarOpen={() => {
          if (!isDesktop) {
            document
              .getElementById('Layer__datepicker__portal')
              ?.classList.remove('Layer__datepicker__portal--closed')
            document
              .getElementById('Layer__datepicker__portal')
              ?.classList.add('Layer__datepicker__portal--opened')
          }
          console.log('Calendar Opened')
        }}
        onCalendarClose={() => {
          if (!isDesktop) {
            document
              .getElementById('Layer__datepicker__portal')
              ?.classList.add('Layer__datepicker__portal--closed')
            document
              .getElementById('Layer__datepicker__portal')
              ?.classList.remove('Layer__datepicker__portal--opened')
          }
          console.log('Calendar Closed')
        }}
        portalId='Layer__datepicker__portal'
        {...props}
      >
        {mode === 'dayRangePicker' && (
          <DatePickerOptions
            options={options}
            setSelectedDate={setSelectedDates}
          />
        )}
      </ReactDatePicker>
      {navigateArrows && !isDesktop && (
        <>
          <Button
            aria-label='Previous Date'
            className={classNames(
              'Layer__datepicker__prev-button',
              isBeforeMinDate && 'Layer__datepicker__button--disabled',
            )}
            onClick={() => changeDate(-1)}
            variant={ButtonVariant.secondary}
            disabled={isBeforeMinDate}
          >
            <ChevronLeft className='Layer__datepicker__button-icon' size={16} />
          </Button>
          <Button
            aria-label='Next Date'
            variant={ButtonVariant.secondary}
            className={classNames(
              'Layer__datepicker__next-button',
              isTodayOrAfter
                ? 'Layer__datepicker__button--disabled'
                : undefined,
            )}
            onClick={() => changeDate(1)}
            disabled={isTodayOrAfter}
          >
            <ChevronRight
              className='Layer__datepicker__button-icon'
              size={16}
            />
          </Button>
        </>
      )}
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

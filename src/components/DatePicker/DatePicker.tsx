import React, { useEffect, useRef, useState, type FC } from 'react'
import * as RDP from 'react-datepicker'
import { useSizeClass } from '../../hooks/useWindowSize'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button, ButtonVariant } from '../Button'
import { CustomDateRange, DatePickerOptions } from './DatePickerOptions'
import type {
  DatePickerMode,
  DatePickerModeSelectorProps,
} from './ModeSelector/DatePickerModeSelector'
import classNames from 'classnames'

/**
 * @see https://github.com/Hacker0x01/react-datepicker/issues/1333#issuecomment-2363284612
 */
const ReactDatePicker = (((RDP.default as any).default as any)
  || (RDP.default as any)
  || (RDP as any)) as typeof RDP.default

interface DatePickerProps {
  mode: DatePickerMode
  selected: Date | [Date | null, Date | null]
  onChange: (date: Date | [Date, Date | null]) => void
  allowedModes?: ReadonlyArray<DatePickerMode>
  dateFormat?: string
  timeIntervals?: number
  timeCaption?: string
  placeholderText?: string
  customDateRanges?: CustomDateRange[]
  wrapperClassName?: string
  calendarClassName?: string
  popperClassName?: string
  currentDateOption?: boolean
  minDate?: Date
  maxDate?: Date
  navigateArrows?: boolean
  onChangeMode?: (mode: DatePickerMode) => void
  slots?: {
    ModeSelector: FC<DatePickerModeSelectorProps>
  }
}

const getDefaultRangeDate = (
  date: 'start' | 'end',
  mode: DatePickerProps['mode'],
  selected: Date | [Date | null, Date | null],
) => {
  try {
    if (isRangeMode(mode) && selected) {
      if (date === 'end') {
        return (selected as [Date | null, Date | null])[1]
      }
      return (selected as [Date | null, Date | null])[0]
    }

    return null
  } catch (_err) {
    return null
  }
}

const isRangeMode = (mode: DatePickerProps['mode']) =>
  mode === 'dayRangePicker' || mode === 'monthRangePicker'

export const DatePicker = ({
  selected,
  onChange,
  mode = 'dayPicker',
  allowedModes,
  dateFormat = mode === 'monthPicker' || mode === 'monthRangePicker'
    ? 'MMM, yyyy'
    : mode === 'timePicker'
      ? 'h:mm aa'
      : 'MMM d, yyyy',
  timeIntervals = 15,
  timeCaption,
  placeholderText: _placeholderText,
  customDateRanges,
  wrapperClassName,
  calendarClassName,
  popperClassName,
  minDate,
  maxDate = new Date(),
  currentDateOption = true,
  navigateArrows = mode === 'monthPicker',
  onChangeMode,
  slots,
  ...props
}: DatePickerProps) => {
  const { ModeSelector } = slots ?? {}

  const pickerRef = useRef<{
    setOpen: (open: boolean, skipSetBlur?: boolean) => void;
    isCalendarOpen: () => boolean;
  }>(null)

  const [updatePickerDate, setPickerDate] = useState<boolean>(false)
  const [selectedDates, setSelectedDates] = useState<
    Date | [Date | null, Date | null] | null
  >(selected)

  const { isDesktop } = useSizeClass()

  const [startDate, setStartDate] = useState<Date | null>(
    getDefaultRangeDate('start', mode, selected) ?? new Date(),
  )
  const [endDate, setEndDate] = useState<Date | null>(
    getDefaultRangeDate('end', mode, selected),
  )

  useEffect(() => {
    try {
      setPickerDate(true)
      if (
        !isRangeMode(mode)
        && (selected as Date | null)?.getTime()
          !== (selectedDates as Date | null)?.getTime()
      ) {
        setSelectedDates(selected)
        return
      }

      if (isRangeMode(mode) && Array.isArray(selected)) {
        if ((startDate as Date | null)?.getTime() !== selected[0]?.getTime()) {
          setStartDate(selected[0])
        }
        if ((endDate as Date | null)?.getTime() !== selected[1]?.getTime()) {
          setEndDate(selected[1])
        }
      }
    } catch (_err) {
      return
    }
  }, [selected])

  useEffect(() => {
    if (
      onChange
      && (!isRangeMode(mode) || (isRangeMode(mode) && !updatePickerDate))
    ) {
      onChange(selectedDates as Date | [Date, Date])
    } else {
      setPickerDate(false)
    }
  }, [selectedDates])

  useEffect(() => {
    if (isRangeMode(mode)) {
      setSelectedDates([startDate, endDate])
    }
  }, [startDate, endDate])

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
    mode === 'timePicker' && 'Layer__datepicker__time__popper',
    popperClassName,
  )

  const handleDateChange = (date: Date | [Date | null, Date | null]) => {
    if (isRangeMode(mode)) {
      const [start, end] = date as [Date | null, Date | null]
      setStartDate(start)
      setEndDate(end)
      return
    }

    setSelectedDates(date)
  }

  const isCurrentDate = () => {
    const currentDate = new Date()
    if (mode === 'dayPicker') {
      return (
        selectedDates instanceof Date
        && selectedDates.toDateString() === currentDate.toDateString()
      )
    } else if (mode === 'monthPicker') {
      return (
        selectedDates instanceof Date
        && selectedDates.getMonth() === currentDate.getMonth()
        && selectedDates.getFullYear() === currentDate.getFullYear()
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

  const onChangeModeInternal = (mode: DatePickerMode) => {
    if (!onChangeMode) {
      console.warn('`onChangeMode` expected when using `ModeSelector`')
      return
    }

    const firstSelectedDate = Array.isArray(selectedDates)
      ? selectedDates[0]
      : (selectedDates ?? new Date())

    if (isRangeMode(mode)) {
      setStartDate(firstSelectedDate)
      setEndDate(firstSelectedDate)
      setSelectedDates([firstSelectedDate, firstSelectedDate])
    } else {
      setStartDate(null)
      setEndDate(null)
      setSelectedDates(firstSelectedDate)
    }

    onChangeMode(mode)
  }

  return (
    <div className={wrapperClassNames}>
      <ReactDatePicker
      // @ts-expect-error = There is no good way to define the type of the ref
        ref={pickerRef}
        wrapperClassName={datePickerWrapperClassNames}
        startDate={isRangeMode(mode) ? startDate : undefined}
        endDate={isRangeMode(mode) ? endDate : undefined}
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
        selectsRange={isRangeMode(mode)}
        showMonthYearPicker={
          mode === 'monthPicker' || mode === 'monthRangePicker'
        }
        dateFormat={dateFormat}
        renderDayContents={day => (
          <span className='Layer__datepicker__day-contents'>{day}</span>
        )}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        timeFormat='h mm aa'
        showTimeSelect={mode === 'timePicker'}
        showTimeSelectOnly={mode === 'timePicker'}
        minDate={minDate}
        maxDate={maxDate}
        withPortal={!isDesktop}
        onCalendarOpen={() => {
          if (!isDesktop) {
            setTimeout(() => {
              document
                .getElementById('Layer__datepicker__portal')
                ?.classList.remove('Layer__datepicker__portal--closed')
              document
                .getElementById('Layer__datepicker__portal')
                ?.classList.add('Layer__datepicker__portal--opened')
            }, 10)
          }
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
        }}
        portalId='Layer__datepicker__portal'
        onFocus={e => (e.target.readOnly = true)}
        onInputClick={() => {
          if (pickerRef.current && !isDesktop) {
            pickerRef.current.setOpen(!pickerRef.current.isCalendarOpen())
          }
        }}
        {...props}
      >
        {ModeSelector && (
          <ModeSelector
            mode={mode}
            allowedModes={allowedModes ?? [mode]}
            onChangeMode={onChangeModeInternal}
          />
        )}
        {mode === 'dayRangePicker' && (
          <DatePickerOptions
            customDateRanges={customDateRanges}
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
      {currentDateOption
        && (mode === 'dayPicker' || mode === 'monthPicker') && (
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

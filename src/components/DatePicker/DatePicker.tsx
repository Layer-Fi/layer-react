import * as RDP from 'react-datepicker'
import React, { useEffect, useMemo, useRef, useState, type FC } from 'react'
import {
  DateContext,
  useDateContext,
  useGlobalDateContext,
} from '../../contexts/DateContext'
import { useDate } from '../../hooks/useDate'
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
import { endOfDay, endOfMonth } from 'date-fns'

/**
 * @see https://github.com/Hacker0x01/react-datepicker/issues/1333#issuecomment-2363284612
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const ReactDatePicker = (((RDP.default as any).default as any)
  || (RDP.default as any)
  || (RDP as any)) as typeof RDP.default
/* eslint-enable @typescript-eslint/no-explicit-any */

interface DatePickerProps {
  mode: DatePickerMode
  selected?: Date | [Date | null, Date | null]
  defaultSelected?: Date | [Date | null, Date | null]
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
  syncWithGlobalDate?: boolean
  withDateContext?: boolean
}

const isRangeMode = (mode: DatePickerProps['mode']) =>
  mode === 'dayRangePicker' || mode === 'monthRangePicker'

export const DatePicker = ({
  withDateContext = true,
  ...props
}: DatePickerProps) => {
  const { date: globalDateRange } = useGlobalDateContext()

  const defaultValues = useMemo(() => {
    if (props.syncWithGlobalDate) {
      return {
        startDate: globalDateRange.startDate,
        endDate: globalDateRange.endDate,
      }
    }

    if (props.defaultSelected && isRangeMode(props.mode)) {
      return {
        startDate: (props.defaultSelected as [Date, Date])[0],
        endDate: (props.defaultSelected as [Date, Date])[1],
      }
    }

    if (props.defaultSelected) {
      return {
        startDate: props.defaultSelected as Date,
        endDate: endOfDay(props.defaultSelected as Date),
      }
    }

    if (!props.selected) {
      // @TODO check for globals and set globals instead if exists
      return {}
    }

    if (
      isRangeMode(props.mode)
      && (props.selected as [Date, Date])[0]
      && (props.selected as [Date, Date])[1]
    ) {
      return {
        startDate: (props.selected as [Date, Date])[0],
        endDate: (props.selected as [Date, Date])[1],
      }
    }

    return {
      startDate: props.selected as Date,
      endDate: endOfDay(props.selected as Date),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dateContext = useDate(defaultValues)

  if (!withDateContext) {
    return <DatePickerController {...props} />
  }

  return (
    <DateContext.Provider value={dateContext}>
      <DatePickerController {...props} />
    </DateContext.Provider>
  )
}

export const DatePickerController = ({
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
  syncWithGlobalDate = false,
  ...props
}: DatePickerProps) => {
  const { date: globalDateRange, setDate: setGlobalDateRange } =
    useGlobalDateContext()
  const { date, setDate } = useDateContext()
  const { ModeSelector } = slots ?? {}

  const pickerRef = useRef<{
    setOpen: (open: boolean, skipSetBlur?: boolean) => void;
    isCalendarOpen: () => boolean;
  }>(null)

  const [selectingDates, setSelectingDates] = useState<boolean>(false)

  const { isDesktop } = useSizeClass()

  const [startDate, setStartDate] = useState<Date | null>(
    date.startDate ?? new Date(),
  )
  const [endDate, setEndDate] = useState<Date | null>(
    date.endDate ?? endOfDay(new Date()),
  )

  useEffect(() => {
    if (!selected) {
      return
    }

    if (isRangeMode(mode) && Array.isArray(selected)) {
      if ((selected as [Date, Date])[0]) {
        setStartDate((selected as [Date, Date])[0])
      }
      if ((selected as [Date, Date])[1]) {
        setEndDate((selected as [Date, Date])[1])
      }
      return
    }

    setStartDate(selected as Date)
  }, [mode, selected])

  useEffect(() => {
    if (
      selectingDates === false
      && startDate
      && endDate
      && JSON.stringify({ s: date.startDate, e: date.endDate })
      !== JSON.stringify({ s: startDate, e: endDate })
    ) {
      if (onChange) {
        if (isRangeMode(mode)) {
          onChange(startDate)
        } else {
          onChange([startDate, endDate])
        }
      }
      setDate({ startDate, endDate })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectingDates])

  useEffect(() => {
    if (
      syncWithGlobalDate
      && date.startDate
      && date.endDate
      && JSON.stringify({ s: date.startDate, e: date.endDate })
      !== JSON.stringify({
        s: globalDateRange.startDate,
        e: globalDateRange.endDate,
      })
    ) {
      setGlobalDateRange({
        startDate: date.startDate,
        endDate: date.endDate,
      })
    }

    if (startDate !== date.startDate) {
      setStartDate(date.startDate)
    }

    if (endDate !== date.endDate) {
      setEndDate(date.endDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => {
    if (
      syncWithGlobalDate
      && globalDateRange.startDate
      && globalDateRange.endDate
      && (!date
        || (date
          && JSON.stringify({
            startDateL: globalDateRange.startDate,
            endDate: globalDateRange.endDate,
          })
          !== JSON.stringify({
            startDate: date.startDate,
            endDate: date.endDate,
          })))
    ) {
      setDate({
        startDate: globalDateRange.startDate,
        endDate: globalDateRange.endDate,
      })
      setStartDate(globalDateRange.startDate)
      setEndDate(globalDateRange.endDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDateRange])

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
    if (date && Array.isArray(date) && isRangeMode(mode)) {
      const [s, e] = date as [Date | null, Date | null]
      if (!e) {
        setSelectingDates(true)
        if (s) {
          setStartDate(s)
        }
        setEndDate(null)
      } else {
        if (s) {
          setStartDate(s)
        }
        if (e) {
          setEndDate(e)
        }
        setSelectingDates(false)
      }
    } else if (date && !isRangeMode(mode)) {
      setStartDate(date as Date)
      setEndDate(endOfDay(date as Date))
      setDate({
        startDate: date as Date,
        endDate: endOfDay(date as Date),
      })
    }
  }

  const isCurrentDate = () => {
    const currentDate = new Date()
    if (mode === 'dayPicker') {
      return (
        startDate instanceof Date
        && startDate.toDateString() === currentDate.toDateString()
      )
    } else if (mode === 'monthPicker') {
      return (
        startDate instanceof Date
        && startDate.getMonth() === currentDate.getMonth()
        && startDate.getFullYear() === currentDate.getFullYear()
      )
    }
    return false
  }

  const setCurrentDate = () => {
    const currentDate = new Date()
    if (mode === 'dayPicker') {
      setDate({ startDate: currentDate, endDate: endOfDay(currentDate) })
    } else if (mode === 'monthPicker') {
      setDate({
        startDate: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        ),
        endDate: endOfMonth(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        ),
      })
    }
  }

  const isTodayOrAfter = Boolean(
    !isRangeMode(mode) && startDate instanceof Date && startDate >= new Date(),
  )

  const isBeforeMinDate = Boolean(
    minDate && startDate instanceof Date && startDate <= minDate,
  )

  const changeDate = (value: number) => {
    if (mode === 'dayPicker') {
      const newDate = new Date(
        (date.startDate as Date).setDate(
          (date.startDate as Date).getDate() + value,
        ),
      )
      setDate({
        startDate: newDate,
        endDate: endOfDay(newDate),
      })
    } else if (mode === 'monthPicker') {
      const newDate = new Date(
        (date.startDate as Date).setMonth(
          (date.startDate as Date).getMonth() + value,
        ),
      )

      setDate({ startDate: newDate, endDate: endOfMonth(newDate) })
    }
  }

  const onChangeModeInternal = (mode: DatePickerMode) => {
    if (!onChangeMode) {
      console.warn('`onChangeMode` expected when using `ModeSelector`')
      return
    }

    // const firstSelectedDate = Array.isArray(selectedDates)
    //   ? selectedDates[0]
    //   : (selectedDates ?? new Date())

    // if (isRangeMode(mode)) {
    //   setStartDate(firstSelectedDate)
    //   setEndDate(firstSelectedDate)
    //   setSelectedDates([firstSelectedDate, firstSelectedDate])
    // } else {
    //   setStartDate(null)
    //   setEndDate(null)
    //   setSelectedDates(firstSelectedDate)
    // }

    onChangeMode(mode)
  }

  return (
    <div className={wrapperClassNames}>
      <ReactDatePicker
        // @ts-expect-error = There is no good way to define the type of the ref
        ref={pickerRef}
        wrapperClassName={datePickerWrapperClassNames}
        startDate={startDate}
        endDate={isRangeMode(mode) ? endDate : undefined}
        selected={startDate}
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
            setSelectedDate={([s, e]) => {
              setStartDate(s)
              setEndDate(e)
            }}
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

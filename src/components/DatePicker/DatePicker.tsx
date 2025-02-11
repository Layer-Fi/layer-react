import { useMemo, useRef } from 'react'
import * as RDP from 'react-datepicker'
import { useSizeClass } from '../../hooks/useWindowSize'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button, ButtonVariant } from '../Button'
import { DatePickerOptions } from './DatePickerOptions'
import type {
  UnifiedPickerMode,
} from './ModeSelector/DatePickerModeSelector'
import classNames from 'classnames'
import { endOfDay } from 'date-fns'
import { useGlobalDate } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDate } from '../../hooks/useDate'
import { DateContext } from '../../contexts/DateContext'
import { DatePickerProps } from './types'
import {
  buildContextDefaultValues,
  getEndDateBasedOnMode,
  isRangeMode,
  showNavigationArrows,
} from './utils'
import { useDatePickerState } from './useDatePickerState'

/**
 * @see https://github.com/Hacker0x01/react-datepicker/issues/1333#issuecomment-2363284612
 */
/* eslint-disable @typescript-eslint/no-explicit-any,
     @typescript-eslint/no-unnecessary-type-assertion,
     @typescript-eslint/no-unsafe-member-access,
*/
const ReactDatePicker = (((RDP.default as any).default as any)
  || (RDP.default as any)
  || (RDP as any)) as typeof RDP.default
/* eslint-enable @typescript-eslint/no-explicit-any,
     @typescript-eslint/no-unnecessary-type-assertion,
     @typescript-eslint/no-unsafe-member-access,
*/

export const DatePicker = (props: DatePickerProps) => {
  const { startDate, endDate } = useGlobalDate()

  const defaultValues = useMemo(() => buildContextDefaultValues(props, startDate, endDate), [])

  const dateContext = useDate(defaultValues)

  return (
    <DateContext.Provider value={dateContext}>
      <DatePickerController {...props} />
    </DateContext.Provider>
  )
}

const DatePickerController = ({
  selected,
  defaultSelected,
  onChange,
  disabled,
  displayMode = 'dayPicker',
  allowedModes,
  dateFormat = displayMode === 'monthPicker' || displayMode === 'monthRangePicker'
    ? 'MMM, yyyy'
    : displayMode === 'timePicker'
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
  navigateArrows = displayMode === 'monthPicker' ? ['mobile'] : undefined,
  onChangeMode,
  syncWithGlobalDate = true,
  slots,
  ...props
}: DatePickerProps) => {
  const {
    setDate,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setSelectingInternalDates,
    isTodayOrAfter,
    isBeforeMinDate,
    isCurrentDate,
    setCurrentDate,
    pickerMode,

  } = useDatePickerState({
    selected,
    onChange,
    displayMode,
    allowedModes,
    minDate,
    maxDate,
    syncWithGlobalDate,
  })

  const { ModeSelector } = slots ?? {}

  const pickerRef = useRef<{
    setOpen: (open: boolean, skipSetBlur?: boolean) => void
    isCalendarOpen: () => boolean
  }>(null)

  const { isDesktop } = useSizeClass()

  const wrapperClassNames = classNames(
    'Layer__datepicker__wrapper',
    displayMode === 'timePicker' && 'Layer__datepicker__time__wrapper',
    showNavigationArrows(navigateArrows, isDesktop) && 'Layer__datepicker__wrapper--arrows',
  )

  const datePickerWrapperClassNames = classNames(
    'Layer__datepicker',
    displayMode === 'timePicker' && 'Layer__datepicker__time',
    wrapperClassName,
  )
  const calendarClassNames = classNames(
    'Layer__datepicker__calendar',
    calendarClassName,
  )
  const popperClassNames = classNames(
    'Layer__datepicker__popper',
    displayMode === 'timePicker' && 'Layer__datepicker__time__popper',
    popperClassName,
  )

  const handleDateChange = (date: Date | [Date | null, Date | null]) => {
    if (date && Array.isArray(date) && isRangeMode(displayMode)) {
      const [s, e] = date
      if (!e) {
        setSelectingInternalDates(true)
        if (s) {
          setStartDate(s)
        }
        setEndDate(null)
      }
      else {
        if (s) {
          setStartDate(s)
        }
        if (e) {
          setEndDate(e)
        }
        setSelectingInternalDates(false)
      }
    }
    else if (date && !isRangeMode(displayMode)) {
      setStartDate(date as Date)
      setEndDate(endOfDay(date as Date))
      setDate({
        startDate: date as Date,
        endDate: getEndDateBasedOnMode(date as Date, displayMode),
      })
    }
  }

  const handleNavigateDate = (value: number) => {
    if (!startDate) {
      return
    }

    switch (pickerMode) {
      case 'dayPicker':
        onChange?.(new Date(startDate.setDate(startDate.getDate() + value)))
        break
      case 'monthPicker':
        onChange?.(new Date(startDate.setMonth(startDate.getMonth() + value)))
        break
      case 'yearPicker':
        onChange?.(new Date(startDate.setFullYear(startDate.getFullYear() + value)))
        break
      default:
        break
    }
  }

  const handleSetCustomDate = (selectedCustomDate: Date | [Date, Date | null]) => {
    handleDateChange(selectedCustomDate)
    pickerRef.current?.setOpen(false)
  }

  const handleChangeMode = (selectedMode: UnifiedPickerMode) => {
    if (!onChangeMode) {
      console.warn('`onChangeMode` expected when using `ModeSelector`')
      return
    }

    onChangeMode(selectedMode)
  }

  return (
    <div className={wrapperClassNames}>
      <ReactDatePicker
        // @ts-expect-error = There is no good way to define the type of the ref
        ref={pickerRef}
        wrapperClassName={datePickerWrapperClassNames}
        startDate={startDate}
        endDate={isRangeMode(displayMode) ? endDate : undefined}
        selected={startDate}
        onChange={handleDateChange}
        calendarClassName={calendarClassNames}
        popperClassName={popperClassNames}
        enableTabLoop={false}
        popperPlacement='bottom-start'
        selectsRange={isRangeMode(displayMode)}
        showMonthYearPicker={
          pickerMode === 'monthPicker' || pickerMode === 'monthRangePicker'
        }
        showYearPicker={pickerMode === 'yearPicker'}
        dateFormat={dateFormat}
        renderDayContents={day => (
          <span className='Layer__datepicker__day-contents'>{day}</span>
        )}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        timeFormat='h mm aa'
        showTimeSelect={pickerMode === 'timePicker'}
        showTimeSelectOnly={pickerMode === 'timePicker'}
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
        onFocus={(e) => {
          // Workaround for mobile devices to prevent the keyboard drawer from appearing
          e.target.blur()
        }}
        disabled={disabled}
        {...props}
      >
        {(ModeSelector && pickerMode !== 'timePicker')
          ? (
            <ModeSelector
              mode={pickerMode}
              allowedModes={allowedModes ?? [pickerMode]}
              onChangeMode={handleChangeMode}
            />
          )
          : null}
        {pickerMode === 'dayRangePicker' && (
          <DatePickerOptions
            customDateRanges={customDateRanges}
            setSelectedDate={handleSetCustomDate}
          />
        )}
      </ReactDatePicker>
      {showNavigationArrows(navigateArrows, isDesktop) && (
        <>
          <Button
            aria-label='Previous Date'
            className={classNames(
              'Layer__datepicker__prev-button',
              isBeforeMinDate && 'Layer__datepicker__button--disabled',
            )}
            onClick={() => handleNavigateDate(-1)}
            variant={ButtonVariant.secondary}
            disabled={isBeforeMinDate || disabled}
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
            onClick={() => handleNavigateDate(1)}
            disabled={isTodayOrAfter || disabled}
          >
            <ChevronRight
              className='Layer__datepicker__button-icon'
              size={16}
            />
          </Button>
        </>
      )}
      {currentDateOption
      && (
        pickerMode === 'dayPicker'
        || pickerMode === 'monthPicker'
        || pickerMode === 'yearPicker'
      )
      && (
        <Button
          className='Layer__datepicker__current-button'
          onClick={setCurrentDate}
          variant={ButtonVariant.secondary}
          disabled={isCurrentDate() || disabled}
        >
          {pickerMode === 'dayPicker' ? 'Today' : 'Current'}
        </Button>
      )}
    </div>
  )
}

import { useMemo, useRef, useState, type FC } from 'react'
import * as RDP from 'react-datepicker'
import { useSizeClass } from '../../hooks/useWindowSize'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button, ButtonVariant } from '../Button'
import { CustomDateRange, DatePickerOptions } from './DatePickerOptions'
import type {
  UnifiedPickerMode,
  DatePickerModeSelectorProps,
} from './ModeSelector/DatePickerModeSelector'
import classNames from 'classnames'
import { endOfDay, endOfMonth, endOfYear } from 'date-fns'
import { useGlobalDate } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDate } from '../../hooks/useDate'

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

type NavigationArrows = 'desktop' | 'mobile'

interface DatePickerProps {
  displayMode: UnifiedPickerMode | 'timePicker'
  selected?: Date | [Date, Date | null]
  defaultSelected?: Date | [Date, Date | null]
  onChange: (date: Date | [Date, Date | null]) => void
  disabled?: boolean
  allowedModes?: ReadonlyArray<UnifiedPickerMode>
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
  maxDate?: Date | null
  navigateArrows?: NavigationArrows[]
  onChangeMode?: (mode: UnifiedPickerMode) => void
  syncWithGlobalDate?: boolean
  slots?: {
    ModeSelector: FC<DatePickerModeSelectorProps>
  }
}

const isRangeMode = (displayMode: DatePickerProps['displayMode']) =>
  displayMode === 'dayRangePicker' || displayMode === 'monthRangePicker'

const showNavigationArrows = (navigateArrows?: NavigationArrows[], isDesktop?: boolean) => {
  return (navigateArrows && ((isDesktop && navigateArrows.includes('desktop')) || (!isDesktop && navigateArrows.includes('mobile'))))
}

export const DatePicker = ({
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
  syncWithGlobalDate,
  slots,
  ...props
}: DatePickerProps) => {
  const { ModeSelector } = slots ?? {}

  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDate()
  const globalDateRange = { startDate: globalStartDate, endDate: globalEndDate }

  const defaultValues = useMemo(() => {
    if (syncWithGlobalDate) {
      return {
        startDate: globalDateRange.startDate,
        endDate: globalDateRange.endDate,
      }
    }

    if (defaultSelected && isRangeMode(displayMode)) {
      return {
        startDate: (defaultSelected as [Date, Date])[0],
        endDate: (defaultSelected as [Date, Date])[1],
      }
    }

    if (defaultSelected) {
      return {
        startDate: defaultSelected as Date,
        endDate: endOfDay(defaultSelected as Date),
      }
    }

    if (!selected) {
      return {}
    }

    if (
      isRangeMode(displayMode)
      && (selected as [Date, Date])[0]
      && (selected as [Date, Date])[1]
    ) {
      return {
        startDate: (selected as [Date, Date])[0],
        endDate: (selected as [Date, Date])[1],
      }
    }
    return {
      startDate: selected as Date,
      endDate: endOfDay(selected as Date),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // To track prev vs new value in the useEffect
  // const dateRef = useRef<DateState | null>(null)

  // const dateContext = useDate(defaultValues)

  const { date, setDate } = useDate({
    startDate: defaultValues.startDate,
    endDate: defaultValues.endDate,
  })

  const [selectingDates, setSelectingDates] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date | null>(
    date.startDate ?? new Date(),
  )
  const [endDate, setEndDate] = useState<Date | null>(
    date.endDate ?? endOfDay(new Date()),
  )

  const pickerRef = useRef<{
    setOpen: (open: boolean, skipSetBlur?: boolean) => void
    isCalendarOpen: () => boolean
  }>(null)

  const pickerMode = useMemo(() => {
    if (!allowedModes) {
      return displayMode
    }

    if (displayMode === 'timePicker') {
      return displayMode
    }

    if (allowedModes.includes(displayMode)) {
      return displayMode
    }

    return allowedModes[0] ?? displayMode
  }, [displayMode, allowedModes])

  // const [firstDate, secondDate] = useMemo(() => {
  //   if (selected instanceof Date) {
  //     return [selected, null] as const
  //   }

  //   if (isRangeMode(displayMode)) {
  //     return selected
  //   }

  //   return [selected[0], null] as const
  // }, [selected, displayMode])

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

  const [internalStart, setInternalStart] = useState<Date | null>(null)
  const [internalEnd, setInternalEnd] = useState<Date | null>(null)

  const isMidSelection = internalStart !== null && internalEnd === null

  const handleDateChange = (selectedDate: Date | [Date, Date | null]) => {
    if (selectedDate instanceof Date) {
      onChange(selectedDate)
      return
    }

    const [start, end] = selectedDate

    if (!end) {
      if (isRangeMode(pickerMode)) {
        setInternalStart(start)
        setInternalEnd(null)
      }
      else {
        onChange(start)
      }
      return
    }

    onChange([start, end])
    setInternalStart(null)
    setInternalEnd(null)
  }

  const handleSetCustomDate = (selectedCustomDate: Date | [Date, Date | null]) => {
    handleDateChange(selectedCustomDate)
    pickerRef.current?.setOpen(false)
  }

  const isCurrentDate = () => {
    const currentDate = new Date()

    switch (pickerMode) {
      case 'dayPicker':
        return startDate?.toDateString() === currentDate.toDateString()
      case 'monthPicker':
        return (
          startDate?.getMonth() === currentDate.getMonth()
          && startDate?.getFullYear() === currentDate.getFullYear()
        )
      case 'yearPicker':
        return startDate?.getFullYear() === currentDate.getFullYear()
      default:
        return false
    }
  }

  const setCurrentDate = () => {
    const currentDate = new Date()

    switch (pickerMode) {
      case 'dayPicker':
        onChange(currentDate)
        break
      case 'monthPicker':
        onChange(currentDate)
        break
      case 'yearPicker':
        onChange(currentDate)
        break
      default:
        break
    }
  }

  const isTodayOrAfter = useMemo(() => {
    if (!startDate) {
      return false
    }

    switch (displayMode) {
      case 'dayPicker':
        return startDate >= endOfDay(new Date()) || (maxDate && startDate >= maxDate)
      case 'monthPicker':
        return (
          endOfMonth(startDate) >= endOfMonth(new Date())
          || (maxDate && endOfMonth(startDate) >= maxDate)
        )
      case 'yearPicker':
        return (
          endOfYear(startDate) >= endOfYear(new Date())
          || (maxDate && endOfYear(startDate) >= maxDate)
        )
      default:
        return false
    }
  }, [startDate, maxDate, displayMode])

  const isBeforeMinDate = Boolean(minDate && startDate && startDate <= minDate)

  const handleNavigateDate = (value: number) => {
    if (!startDate) {
      return
    }

    switch (pickerMode) {
      case 'dayPicker':
        onChange(new Date(startDate.setDate(startDate.getDate() + value)))
        break
      case 'monthPicker':
        onChange(new Date(startDate.setMonth(startDate.getMonth() + value)))
        break
      case 'yearPicker':
        onChange(new Date(startDate.setFullYear(startDate.getFullYear() + value)))
        break
      default:
        break
    }
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

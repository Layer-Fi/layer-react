import { Button, ButtonVariant } from '../Button/Button'
import { useMemo, useRef, useState, type FC } from 'react'
import * as RDP from 'react-datepicker'
import { useSizeClass } from '../../hooks/useWindowSize/useWindowSize'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { CustomDateRange, DeprecatedDatePickerOptions } from './DeprecatedDatePickerOptions'
import type {
  UnifiedPickerMode,
  DeprecatedDatePickerModeSelectorProps,
} from './ModeSelector/DeprecatedDatePickerModeSelector'
import classNames from 'classnames'
import { endOfDay, endOfMonth, endOfYear, getYear } from 'date-fns'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import './deprecatedDatePicker.scss'

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

interface DeprecatedDatePickerProps {
  displayMode: UnifiedPickerMode | 'timePicker'
  selected: Date | [Date, Date | null]
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
  slots?: {
    ModeSelector: FC<DeprecatedDatePickerModeSelectorProps>
  }
  highlightYears?: number[]
}

const isRangeMode = (displayMode: DeprecatedDatePickerProps['displayMode']) =>
  displayMode === 'dayRangePicker' || displayMode === 'monthRangePicker'

const showNavigationArrows = (navigateArrows?: NavigationArrows[], isDesktop?: boolean) => {
  return (navigateArrows && ((isDesktop && navigateArrows.includes('desktop')) || (!isDesktop && navigateArrows.includes('mobile'))))
}

const renderYearContent = (calendarYear: number, highlightYears?: number[]) => {
  if (!highlightYears || !highlightYears.includes(calendarYear)) {
    return (
      <span className='Layer__datepicker__year-content'>
        {calendarYear}
      </span>
    )
  }

  return (
    <span className='Layer__datepicker__year-content'>
      {calendarYear}
      <span className='Layer__datepicker__date-dot' />
    </span>
  )
}

const highlightBackArrow = ({
  currentDate,
  modePicker,
  highlightYears,
}: {
  currentDate: Date
  modePicker: UnifiedPickerMode | 'timePicker'
  highlightYears?: number[]
}) => {
  if (modePicker === 'yearPicker') {
    return Boolean(highlightYears?.find(year => year < getYear(currentDate)))
  }

  return false
}

const highlightNextArrow = ({
  currentDate,
  modePicker,
  highlightYears,
}: {
  currentDate: Date
  modePicker: UnifiedPickerMode | 'timePicker'
  highlightYears?: number[]
}) => {
  if (modePicker === 'yearPicker') {
    return Boolean(highlightYears?.find(year => year > getYear(currentDate)))
  }

  return false
}

const getDateFormat = (mode: UnifiedPickerMode | 'timePicker') => {
  switch (mode) {
    case 'dayPicker':
    case 'dayRangePicker':
      return 'MMM d, yyyy'
    case 'monthPicker':
    case 'monthRangePicker':
      return 'MMM yyyy'
    case 'yearPicker':
      return 'yyyy'
    case 'timePicker':
      return 'h:mm aa'
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid datepicker mode',
      })
  }
}

/**
 * @deprecated This will be replaced with the new `DatePicker` and `DateSelection` components.
 */
export const DeprecatedDatePicker = ({
  selected,
  onChange,
  disabled,
  displayMode = 'dayPicker',
  allowedModes,
  dateFormat = getDateFormat(displayMode),
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
  highlightYears,
  onChangeMode,
  slots,
  ...props
}: DeprecatedDatePickerProps) => {
  const { ModeSelector } = slots ?? {}

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

  const [firstDate, secondDate] = useMemo(() => {
    if (selected instanceof Date) {
      return [selected, null] as const
    }

    if (isRangeMode(displayMode)) {
      return selected
    }

    return [selected[0], null] as const
  }, [selected, displayMode])

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
        return firstDate.toDateString() === currentDate.toDateString()
      case 'monthPicker':
        return (
          firstDate.getMonth() === currentDate.getMonth()
          && firstDate.getFullYear() === currentDate.getFullYear()
        )
      case 'yearPicker':
        return firstDate.getFullYear() === currentDate.getFullYear()
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
    switch (displayMode) {
      case 'dayPicker':
        return firstDate >= endOfDay(new Date()) || (maxDate && firstDate >= maxDate)
      case 'monthPicker':
        return (
          endOfMonth(firstDate) >= endOfMonth(new Date())
          || (maxDate && endOfMonth(firstDate) >= maxDate)
        )
      case 'yearPicker':
        return (
          endOfYear(firstDate) >= endOfYear(new Date())
          || (maxDate && endOfYear(firstDate) >= maxDate)
        )
      default:
        return false
    }
  }, [firstDate, maxDate, displayMode])

  const isBeforeMinDate = Boolean(minDate && firstDate <= minDate)

  const handleNavigateDate = (value: number) => {
    switch (pickerMode) {
      case 'dayPicker':
        onChange(new Date(firstDate.setDate(firstDate.getDate() + value)))
        break
      case 'monthPicker':
        onChange(new Date(firstDate.setMonth(firstDate.getMonth() + value)))
        break
      case 'yearPicker':
        onChange(new Date(firstDate.setFullYear(firstDate.getFullYear() + value)))
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
        startDate={isRangeMode(displayMode)
          ? (isMidSelection
            ? internalStart
            : firstDate)
          : undefined}
        endDate={isRangeMode(displayMode)
          ? (isMidSelection
            ? internalEnd
            : secondDate)
          : undefined}
        selected={
          displayMode !== 'dayRangePicker' && displayMode !== 'monthRangePicker'
            ? firstDate
            : undefined
        }
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
        renderYearContent={d => renderYearContent(d, highlightYears)}
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
          <DeprecatedDatePickerOptions
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
            {highlightBackArrow({
              currentDate: firstDate,
              modePicker: pickerMode,
              highlightYears,
            }) && (
              <span className='Layer__datepicker__nav-arrow-highlight' />
            )}
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
            {highlightNextArrow({
              currentDate: firstDate,
              modePicker: pickerMode,
              highlightYears,
            }) && (
              <span className='Layer__datepicker__nav-arrow-highlight' />
            )}
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

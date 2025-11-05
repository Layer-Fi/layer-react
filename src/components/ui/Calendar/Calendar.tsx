import { forwardRef } from 'react'
import classNames from 'classnames'
import type { ZonedDateTime } from '@internationalized/date'
import {
  Calendar as ReactAriaCalendar,
  type CalendarProps as ReactAriaCalendarProps,
  CalendarGrid as ReactAriaCalendarGrid,
  type CalendarGridProps as ReactAriaCalendarGridProps,
  CalendarGridBody as ReactAriaCalendarGridBody,
  type CalendarGridBodyProps as ReactAriaCalendarGridBodyProps,
  CalendarCell as ReactAriaCalendarCell,
  type CalendarCellProps as ReactAriaCalendarCellProps,
  CalendarGridHeader as ReactAriaCalendarGridHeader,
  type CalendarGridHeaderProps as ReactAriaCalendarGridHeaderProps,
  CalendarHeaderCell as ReactAriaCalendarHeaderCell,
  type CalendarHeaderCellProps as ReactAriaCalendarHeaderCellProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './calendar.scss'

const CALENDAR_CLASS_NAME = 'Layer__UI__Calendar'
type CalendarProps = ReactAriaCalendarProps<ZonedDateTime>

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar({ className, isReadOnly, ...restProps }, ref) {
    const dataProperties = toDataProperties({ readonly: isReadOnly })

    return (
      <ReactAriaCalendar
        {...dataProperties}
        {...restProps}
        isReadOnly={isReadOnly}
        className={classNames(CALENDAR_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

const CALENDAR_GRID_CLASS_NAME = 'Layer__UI__CalendarGrid'
type CalendarGridProps = ReactAriaCalendarGridProps

export const CalendarGrid = forwardRef<HTMLTableElement, CalendarGridProps>(
  function CalendarGrid({ className, ...restProps }, ref) {
    return (
      <ReactAriaCalendarGrid
        {...restProps}
        className={classNames(CALENDAR_GRID_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

const CALENDAR_GRID_BODY_CLASS_NAME = 'Layer__UI__CalendarGridBody'
type CalendarGridBodyProps = ReactAriaCalendarGridBodyProps

export const CalendarGridBody = forwardRef<HTMLTableSectionElement, CalendarGridBodyProps>(
  function CalendarGridBody({ className, ...restProps }, ref) {
    return (
      <ReactAriaCalendarGridBody
        {...restProps}
        className={classNames(CALENDAR_GRID_BODY_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

const CALENDAR_CELL_CLASS_NAME = 'Layer__UI__CalendarCell'
type CalendarCellProps = ReactAriaCalendarCellProps & {
  size?: 'sm' | 'md'
}

export const CalendarCell = forwardRef<HTMLTableCellElement, CalendarCellProps>(
  function CalendarCell({ className, size = 'sm', ...restProps }, ref) {
    const dataProperties = toDataProperties({ size })

    return (
      <ReactAriaCalendarCell
        {...restProps}
        {...dataProperties}
        className={classNames(CALENDAR_CELL_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

const CALENDAR_GRID_HEADER_CLASS_NAME = 'Layer__UI__CalendarGridHeader'
type CalendarGridHeaderProps = ReactAriaCalendarGridHeaderProps

export const CalendarGridHeader = forwardRef<HTMLTableSectionElement, CalendarGridHeaderProps>(
  function CalendarGridHeader({ className, ...restProps }, ref) {
    return (
      <ReactAriaCalendarGridHeader
        {...restProps}
        className={classNames(CALENDAR_GRID_HEADER_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

const CALENDAR_HEADER_CELL_CLASS_NAME = 'Layer__UI__CalendarHeaderCell'
type CalendarHeaderCellProps = ReactAriaCalendarHeaderCellProps & {
  size?: 'sm' | 'md'
}

export const CalendarHeaderCell = forwardRef<HTMLTableCellElement, CalendarHeaderCellProps>(
  function CalendarHeaderCell({ className, size = 'sm', ...restProps }, ref) {
    const dataProperties = toDataProperties({ size })

    return (
      <ReactAriaCalendarHeaderCell
        {...restProps}
        {...dataProperties}
        className={classNames(CALENDAR_HEADER_CELL_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)

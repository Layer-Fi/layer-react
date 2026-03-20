import { parseISO } from 'date-fns'

import { DateFormat } from '@utils/time/timeFormats'

type DateInput = Date | string | number
export type DatePattern = DateFormat

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime())

export const toDate = (value: DateInput): Date | null => {
  if (value === undefined || value === null) {
    return null
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value)
    return isValidDate(parsed) ? parsed : null
  }

  const parsed = new Date(value)
  return isValidDate(parsed) ? parsed : null
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

const DATE_FORMAT_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
}

const DATE_FORMAT_SHORT_PADDED_OPTIONS: Intl.DateTimeFormatOptions = {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
}

const DATE_FORMAT_WITH_TIME_READABLE_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
  timeStyle: 'short',
}

const DATE_FORMAT_WITH_TIME_READABLE_WITH_TIMEZONE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
}

const MONTH_DAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
}

const MONTH_YEAR_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
}

const MONTH_YEAR_FORMAT_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  year: 'numeric',
}

const MONTH_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
}

const MONTH_FORMAT_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
}

const MONTH_FORMAT_NARROW_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'narrow',
}

const YEAR_ONLY_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
}

const TIME_ONLY_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
}

const FORMAT_OPTIONS_BY_PATTERN: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  [DateFormat.Month]: MONTH_FORMAT_OPTIONS,
  [DateFormat.MonthShort]: MONTH_FORMAT_SHORT_OPTIONS,
  [DateFormat.MonthNarrow]: MONTH_FORMAT_NARROW_OPTIONS,
  [DateFormat.MonthDayShort]: MONTH_DAY_FORMAT_OPTIONS,
  [DateFormat.MonthYear]: MONTH_YEAR_FORMAT_OPTIONS,
  [DateFormat.MonthYearShort]: MONTH_YEAR_FORMAT_SHORT_OPTIONS,
  [DateFormat.DateShort]: DATE_FORMAT_OPTIONS,
  [DateFormat.DateNumeric]: DATE_FORMAT_SHORT_OPTIONS,
  [DateFormat.DateNumericPadded]: DATE_FORMAT_SHORT_PADDED_OPTIONS,
  [DateFormat.DateWithTimeReadable]: DATE_FORMAT_WITH_TIME_READABLE_OPTIONS,
  [DateFormat.DateWithTimeReadableWithTimezone]: DATE_FORMAT_WITH_TIME_READABLE_WITH_TIMEZONE_OPTIONS,
  [DateFormat.Time]: TIME_ONLY_OPTIONS,
  [DateFormat.Year]: YEAR_ONLY_OPTIONS,
}

export const getDateFormatOptions = (pattern: DateFormat = DateFormat.DateShort): Intl.DateTimeFormatOptions => {
  return FORMAT_OPTIONS_BY_PATTERN[pattern]
}

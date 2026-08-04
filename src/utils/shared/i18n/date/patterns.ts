export enum MonthPattern {
  Month = 'month', // January
  MonthShort = 'monthShort', // Jan
  MonthNarrow = 'monthNarrow', // J
}

export enum MonthDayPattern {
  MonthDayShort = 'monthDayShort', // Jan 5
}

export enum MonthYearPattern {
  MonthYear = 'monthYear', // January 2026
  MonthYearShort = 'monthYearShort', // Jan 2026
}

export enum DatePattern {
  DateShort = 'dateShort', // Jan 5, 2026
  DateNumeric = 'dateNumeric', // 1/5/2026
  DateNumericPadded = 'dateNumericPadded', // 01/05/2026
}

export enum DayPattern {
  Day = 'day', // 5
}

export enum WeekdayPattern {
  WeekdayShort = 'weekdayShort', // Mon
}

export enum DateWithTimePattern {
  DateWithTimeReadable = 'dateWithTimeReadable', // January 5, 2026 at 3:30 PM
  DateWithTimeReadableWithTimezone = 'dateWithTimeReadableWithTimezone', // January 5, 2026, 3:30 PM PST
  MonthDayWithTimeReadable = 'monthDayWithTimeReadable', // January 5 at 3:30 PM
}

export enum TimePattern {
  Time = 'time', // 3:30 PM
}

export enum YearPattern {
  Year = 'year', // 2026
}

export const DateFormat = {
  ...MonthPattern,
  ...MonthDayPattern,
  ...MonthYearPattern,
  ...DatePattern,
  ...DayPattern,
  ...WeekdayPattern,
  ...DateWithTimePattern,
  ...TimePattern,
  ...YearPattern,
} as const

export type DateFormat = (typeof DateFormat)[keyof typeof DateFormat]

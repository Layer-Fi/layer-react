import { Schema } from 'effect'
import { CalendarDate } from '@internationalized/date'
import { parseDate } from '@internationalized/date'

export const CalendarDateFromSelf = Schema.declare(
  (input: unknown): input is CalendarDate => input instanceof CalendarDate,
)

// Schema that transforms calendar date string (YYYY-MM-DD) to/from CalendarDate
// API format: "2025-11-16" (calendar date string)
// App format: CalendarDate object
export const CalendarDateSchema = Schema.transform(
  Schema.NonEmptyString,
  CalendarDateFromSelf,
  {
    strict: false,
    decode: (dateString: string) => parseDate(dateString),
    encode: calendarDate => calendarDate.toString(),
  },
)

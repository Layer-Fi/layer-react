import { Schema } from 'effect'

import { CalendarDateFromSelf } from '@schemas/common/calendarDateFromSelf'

export const TimeEntryFormSchema = Schema.Struct({
  date: Schema.NullOr(CalendarDateFromSelf),
  durationMinutes: Schema.Number,
  memo: Schema.String,
  customerId: Schema.NullOr(Schema.String),
  serviceId: Schema.String,
})

export type TimeEntryForm = typeof TimeEntryFormSchema.Type

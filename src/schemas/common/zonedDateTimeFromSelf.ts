import { Schema } from 'effect'
import { ZonedDateTime } from '@internationalized/date'

export const ZonedDateTimeFromSelf = Schema.declare(
  (input: unknown): input is ZonedDateTime => input instanceof ZonedDateTime,
)

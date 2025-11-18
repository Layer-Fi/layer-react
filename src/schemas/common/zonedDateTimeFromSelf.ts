import { ZonedDateTime } from '@internationalized/date'
import { Schema } from 'effect'

export const ZonedDateTimeFromSelf = Schema.declare(
  (input: unknown): input is ZonedDateTime => input instanceof ZonedDateTime,
)

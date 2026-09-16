import type { ZonedDateTime } from '@internationalized/date'

export enum DateInvalidReason {
  Empty = 'empty',
  BeforeMin = 'beforeMin',
  AfterMax = 'afterMax',
}

export const getDateInvalidReason = (
  date: ZonedDateTime | null,
  { minDate, maxDate }: { minDate?: ZonedDateTime | null, maxDate?: ZonedDateTime | null },
) => {
  if (date === null) return DateInvalidReason.Empty
  if (minDate && date.compare(minDate) < 0) return DateInvalidReason.BeforeMin
  if (maxDate && date.compare(maxDate) > 0) return DateInvalidReason.AfterMax
  return null
}

import { DurationFormat } from '@formatjs/intl-durationformat'
import type { Duration } from 'date-fns'
import type { IntlShape } from 'react-intl'

export type DurationFormatStyle = 'long' | 'short' | 'narrow' | 'digital'

export type DurationFormatFn = (
  totalMinutes: number,
  options?: { compact?: boolean },
) => string

type DurationFormatOptions = { style: DurationFormatStyle }

export const formatDuration = (
  intl: IntlShape,
  value: Duration,
  options: DurationFormatOptions,
): string => {
  return new DurationFormat(intl.locale, options).format(value)
}

export const formatMinutesAsDuration = (
  intl: IntlShape,
  totalMinutes: number,
  { compact = false }: { compact?: boolean } = {},
): string => {
  const hours = Math.trunc(totalMinutes / 60)
  const minutes = totalMinutes - hours * 60
  return formatDuration(intl, { hours, minutes, seconds: 0 }, { style: compact ? 'digital' : 'short' })
}

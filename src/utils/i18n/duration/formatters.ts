import type { Duration } from 'date-fns'
import type { IntlShape } from 'react-intl'

export type DurationFormatStyle = 'long' | 'short' | 'narrow' | 'digital'

type DurationFormatOptions = { style: DurationFormatStyle }

type DurationFormatInstance = { format: (duration: Duration) => string }

type DurationFormatConstructor = new (
  locales: string | undefined,
  options: DurationFormatOptions,
) => DurationFormatInstance

const getDurationFormatConstructor = (): DurationFormatConstructor | undefined => {
  return (Intl as typeof Intl & { DurationFormat?: DurationFormatConstructor }).DurationFormat
}

const formatHoursMinutesAscii = (hours: number, minutes: number, compact: boolean): string => {
  if (compact) {
    return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`
  }
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

const tryAsciiFallbackForSimpleDuration = (
  value: Duration,
  compact: boolean,
): string | null => {
  if (value.years || value.months || value.weeks || value.days) {
    return null
  }
  return formatHoursMinutesAscii(value.hours ?? 0, value.minutes ?? 0, compact)
}

export const formatDuration = (
  intl: IntlShape,
  value: Duration,
  options: DurationFormatOptions,
): string => {
  const DurationFormat = getDurationFormatConstructor()
  if (typeof DurationFormat === 'function') {
    return new DurationFormat(intl.locale, options).format(value)
  }
  const ascii = tryAsciiFallbackForSimpleDuration(value, options.style === 'digital')
  if (ascii !== null) {
    return ascii
  }
  throw new Error('Intl.DurationFormat is not available in this environment')
}

export type MinutesAsDurationFormatFn = (
  totalMinutes: number,
  options?: { compact?: boolean },
) => string

export const formatMinutesAsDuration = (
  intl: IntlShape,
  totalMinutes: number,
  { compact = false }: { compact?: boolean } = {},
): string => {
  const hours = Math.trunc(totalMinutes / 60)
  const minutes = totalMinutes - hours * 60
  const duration: Duration = { hours, minutes, seconds: 0 }
  const DurationFormat = getDurationFormatConstructor()
  if (typeof DurationFormat === 'function') {
    return new DurationFormat(intl.locale, { style: compact ? 'digital' : 'short' }).format(duration)
  }
  return formatHoursMinutesAscii(hours, minutes, compact)
}

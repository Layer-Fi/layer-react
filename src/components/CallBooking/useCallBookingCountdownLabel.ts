import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'

const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_DAY = 24 * MS_PER_HOUR

enum CountdownKind {
  Days = 'days',
  Hours = 'hours',
  StartingSoon = 'startingSoon',
  None = 'none',
}

type CountdownDescriptor =
  | { kind: CountdownKind.Days | CountdownKind.Hours, value: number }
  | { kind: CountdownKind.StartingSoon | CountdownKind.None }

const getCountdownDescriptor = (now: number, startAt: Date): CountdownDescriptor => {
  const startTime = startAt.getTime()

  if (now >= startTime) {
    return { kind: CountdownKind.None }
  }

  const millisecondsUntilStart = startTime - now

  if (millisecondsUntilStart < MS_PER_HOUR) {
    return { kind: CountdownKind.StartingSoon }
  }

  const hoursUntilStart = millisecondsUntilStart / MS_PER_HOUR

  if (hoursUntilStart < 24) {
    return { kind: CountdownKind.Hours, value: Math.floor(hoursUntilStart) }
  }

  return {
    kind: CountdownKind.Days,
    value: Math.floor(millisecondsUntilStart / MS_PER_DAY),
  }
}

export const useCallBookingCountdownLabel = (eventStartAt: Date | undefined) => {
  const { t } = useTranslation()

  if (eventStartAt == null) {
    return ''
  }

  const descriptor = getCountdownDescriptor(Date.now(), eventStartAt)

  switch (descriptor.kind) {
    case CountdownKind.Days:
      return tPlural(t, 'callBookings:state.call_in_count_days', {
        count: descriptor.value,
        displayCount: descriptor.value,
        one: 'in {{displayCount}} day',
        other: 'in {{displayCount}} days',
      })
    case CountdownKind.Hours:
      return tPlural(t, 'callBookings:state.call_in_count_hours', {
        count: descriptor.value,
        displayCount: descriptor.value,
        one: 'in {{displayCount}} hour',
        other: 'in {{displayCount}} hours',
      })
    case CountdownKind.StartingSoon:
      return t('callBookings:state.starting_soon', 'starting soon')
    case CountdownKind.None:
    default:
      return ''
  }
}

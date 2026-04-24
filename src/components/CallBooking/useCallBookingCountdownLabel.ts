import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'

type CountdownDescriptor =
  | { kind: 'days' | 'hours', value: number }
  | { kind: 'startingSoon' | 'none' }

const getCountdownDescriptor = (now: number, startAt: Date): CountdownDescriptor => {
  const startTime = startAt.getTime()

  if (now >= startTime) {
    return { kind: 'none' }
  }

  const millisecondsUntilStart = startTime - now

  if (millisecondsUntilStart < 60 * 60 * 1000) {
    return { kind: 'startingSoon' }
  }

  const hoursUntilStart = millisecondsUntilStart / (60 * 60 * 1000)

  if (hoursUntilStart < 24) {
    return { kind: 'hours', value: Math.floor(hoursUntilStart) }
  }

  return {
    kind: 'days',
    value: Math.floor(millisecondsUntilStart / (24 * 60 * 60 * 1000)),
  }
}

export const useCallBookingCountdownLabel = (eventStartAt: Date | undefined) => {
  const { t } = useTranslation()

  if (eventStartAt == null) {
    return ''
  }

  const descriptor = getCountdownDescriptor(Date.now(), eventStartAt)

  switch (descriptor.kind) {
    case 'days':
      return tPlural(t, 'callBookings:state.call_in_count_days', {
        count: descriptor.value,
        displayCount: descriptor.value,
        one: 'in {{displayCount}} day',
        other: 'in {{displayCount}} days',
      })
    case 'hours':
      return tPlural(t, 'callBookings:state.call_in_count_hours', {
        count: descriptor.value,
        displayCount: descriptor.value,
        one: 'in {{displayCount}} hour',
        other: 'in {{displayCount}} hours',
      })
    case 'startingSoon':
      return t('callBookings:state.starting_soon', 'starting soon')
    case 'none':
      return ''
  }
}

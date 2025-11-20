import { BigDecimal as BD } from 'effect'

import { TripPurpose } from '@schemas/trip'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'

export const formatDistance = (distance: BD.BigDecimal) => {
  return `${BD.format(distance)} mi`
}

export const getPurposeLabel = (purpose: TripPurpose): string => {
  switch (purpose) {
    case TripPurpose.Business:
      return 'Business'
    case TripPurpose.Personal:
      return 'Personal'
    case TripPurpose.Unreviewed:
      return 'Unreviewed'
    default:
      return safeAssertUnreachable({
        value: purpose,
        message: 'Unexpected trip purpose in `getPurposeLabel`',
        fallbackValue: 'Business' as string,
      }) ?? 'Business'
  }
}

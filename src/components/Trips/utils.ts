import { BigDecimal as BD } from 'effect'
import i18next from 'i18next'

import { TripPurpose } from '@schemas/trip'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BadgeVariant } from '@components/Badge/Badge'

export const formatDistance = (distance: BD.BigDecimal) => {
  return i18next.t('distanceMiles', '{{distance}} mi', { distance: BD.format(distance) })
}

export const getPurposeLabel = (purpose: TripPurpose): string => {
  switch (purpose) {
    case TripPurpose.Business:
      return i18next.t('business', 'Business')
    case TripPurpose.Personal:
      return i18next.t('personal', 'Personal')
    case TripPurpose.Unreviewed:
      return i18next.t('unreviewed', 'Unreviewed')
    default:
      return safeAssertUnreachable({
        value: purpose,
        message: 'Unexpected trip purpose in `getPurposeLabel`',
        fallbackValue: i18next.t('business', 'Business'),
      }) ?? i18next.t('business', 'Business')
  }
}

export const getPurposeBadgeVariant = (purpose: TripPurpose): BadgeVariant => {
  if (purpose === TripPurpose.Business) {
    return BadgeVariant.SUCCESS
  }
  if (purpose === TripPurpose.Personal) {
    return BadgeVariant.INFO
  }
  return BadgeVariant.WARNING
}

import { BigDecimal as BD } from 'effect'
import { type TFunction } from 'i18next'

import { TripPurpose } from '@schemas/trip'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BadgeVariant } from '@components/Badge/Badge'

export const formatDistance = (distance: BD.BigDecimal, t: TFunction) => {
  return t('distanceMiles', '{{distance}} mi', { distance: BD.format(distance) })
}

export const getPurposeLabel = (purpose: TripPurpose, t: TFunction): string => {
  switch (purpose) {
    case TripPurpose.Business:
      return t('business', 'Business')
    case TripPurpose.Personal:
      return t('personal', 'Personal')
    case TripPurpose.Unreviewed:
      return t('unreviewed', 'Unreviewed')
    default:
      return safeAssertUnreachable({
        value: purpose,
        message: 'Unexpected trip purpose in `getPurposeLabel`',
        fallbackValue: t('business', 'Business'),
      }) ?? t('business', 'Business')
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

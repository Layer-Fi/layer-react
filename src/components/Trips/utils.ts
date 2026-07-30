import { BigDecimal as BD } from 'effect'
import { type TFunction } from 'i18next'
import { Briefcase, CircleHelp, House, type LucideIcon } from 'lucide-react'

import { TripPurpose } from '@schemas/trip'
import { type NumberFormatFn } from '@utils/i18n/number/formatters'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BadgeVariant } from '@ui/Badge/Badge'

export const formatDistance = (
  distance: BD.BigDecimal,
  t: TFunction,
  formatNumber: NumberFormatFn,
) => {
  return t('trips:label.distance_mi', '{{distance}} mi', {
    distance: formatNumber(BD.format(distance), { maximumFractionDigits: 2 }),
  })
}

export const getPurposeLabel = (purpose: TripPurpose, t: TFunction): string => {
  switch (purpose) {
    case TripPurpose.Business:
      return t('common:label.business', 'Business')
    case TripPurpose.Personal:
      return t('common:label.personal', 'Personal')
    case TripPurpose.Unreviewed:
      return t('common:state.unreviewed', 'Unreviewed')
    default:
      return safeAssertUnreachable({
        value: purpose,
        message: 'Unexpected trip purpose in `getPurposeLabel`',
        fallbackValue: t('common:label.business', 'Business'),
      }) ?? t('common:label.business', 'Business')
  }
}

export const getPurposeBadgeVariant = (purpose: TripPurpose): BadgeVariant => {
  if (purpose === TripPurpose.Business) {
    return BadgeVariant.SUCCESS
  }
  if (purpose === TripPurpose.Personal) {
    return BadgeVariant.NEUTRAL
  }
  return BadgeVariant.WARNING
}

export const getPurposeIcon = (purpose: TripPurpose): LucideIcon => {
  if (purpose === TripPurpose.Business) {
    return Briefcase
  }
  if (purpose === TripPurpose.Personal) {
    return House
  }
  return CircleHelp
}

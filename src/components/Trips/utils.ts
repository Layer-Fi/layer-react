import { BigDecimal as BD } from 'effect'
import { type TFunction } from 'i18next'

import { TripPurpose } from '@schemas/trip'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type NumberFormatFn } from '@hooks/utils/i18n/useIntlFormatter'
import { BadgeVariant } from '@components/Badge/Badge'

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
    return BadgeVariant.INFO
  }
  return BadgeVariant.WARNING
}

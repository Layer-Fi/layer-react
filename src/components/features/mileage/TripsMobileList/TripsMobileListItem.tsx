import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/mileage/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span } from '@ui/Typography/Text'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'
import { TripsAddressCell } from '@features/mileage/TripAddressCell/TripAddressCell'
import { formatDistance, getPurposeBadgeVariant, getPurposeIcon, getPurposeLabel } from '@features/mileage/utils'

const TripsMobileListItemDistance = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  return (
    <Span weight='bold' numeric='tabular-nums'>{formatDistance(trip.distance, t, formatNumber)}</Span>
  )
}

export const TripsMobileListItem = ({ trip }: { trip: Trip }) => {
  const { formatDate } = useIntlFormatter()

  return (
    <MobileListItemContent
      title={formatCalendarDate(trip.tripDate, formatDate)}
      slots={{ Value: <TripsMobileListItemDistance trip={trip} /> }}
    >
      {(trip.startAddress || trip.endAddress) && <TripsAddressCell trip={trip} />}
    </MobileListItemContent>
  )
}

export const TripsMobileListItemFooter = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation()

  return (
    <MobileListItemStatusFooter
      variant={getPurposeBadgeVariant(trip.purpose)}
      text={getPurposeLabel(trip.purpose, t)}
      slots={{ Icon: getPurposeIcon(trip.purpose) }}
    />
  )
}

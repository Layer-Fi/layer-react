import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemContent } from '@ui/MobileList/MobileListItemContent'
import { MobileListItemStatusFooter } from '@ui/MobileList/MobileListItemStatusFooter'
import { Span } from '@ui/Typography/Text'
import { TripsAddressCell } from '@components/Trips/TripAddressCell/TripAddressCell'
import { formatDistance, getPurposeBadgeVariant, getPurposeIcon, getPurposeLabel } from '@components/Trips/utils'

export const TripsMobileListItem = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation()
  const { formatDate, formatNumber } = useIntlFormatter()

  return (
    <MobileListItemContent
      title={formatCalendarDate(trip.tripDate, formatDate)}
      slots={{
        Value: <Span weight='bold' numeric='tabular-nums'>{formatDistance(trip.distance, t, formatNumber)}</Span>,
      }}
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

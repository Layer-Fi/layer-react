import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemStatusFooter } from '@ui/MobileList/MobileListItemStatusFooter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { TripsAddressCell } from '@components/Trips/TripAddressCell/TripAddressCell'
import { formatDistance, getPurposeBadgeVariant, getPurposeIcon, getPurposeLabel } from '@components/Trips/utils'

import './tripsMobileListItem.scss'

export const TripsMobileListItem = ({ trip }: { trip: Trip }) => {
  const { t } = useTranslation()
  const { formatDate, formatNumber } = useIntlFormatter()

  return (
    <VStack gap='3xs' className='Layer__TripsMobileListItem'>
      <HStack fluid justify='space-between' align='center' gap='sm'>
        <Span weight='bold' ellipsis>{formatCalendarDate(trip.tripDate, formatDate)}</Span>
        <Span weight='bold' numeric='tabular-nums'>{formatDistance(trip.distance, t, formatNumber)}</Span>
      </HStack>
      {(trip.startAddress || trip.endAddress) && <TripsAddressCell trip={trip} />}
    </VStack>
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

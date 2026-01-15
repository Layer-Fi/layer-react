import { useCallback } from 'react'

import { type Trip } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize } from '@components/Badge/Badge'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsAddressCell } from '@components/TripsTable/TripsAddressCell'
import { formatDistance, getPurposeBadgeVariant, getPurposeLabel } from '@components/TripsTable/utils'

import './tripsMobileList.scss'

interface TripsMobileListProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  onViewOrUpsertTrip: (trip: Trip) => void
  paginationProps: TablePaginationProps
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

const TripsMobileListItem = ({ trip }: { trip: Trip }) => (
  <HStack justify='space-between' gap='sm' className='Layer__TripsMobileListItem'>
    <VStack gap='3xs' className='Layer__TripsMobileListItem__LeftContent'>
      <Span weight='bold'>{formatCalendarDate(trip.tripDate)}</Span>
      {(trip.startAddress || trip.endAddress) && <TripsAddressCell trip={trip} />}
    </VStack>
    <VStack gap='3xs' align='end'>
      <Span weight='bold'>{formatDistance(trip.distance)}</Span>
      <Badge size={BadgeSize.SMALL} variant={getPurposeBadgeVariant(trip.purpose)}>
        {getPurposeLabel(trip.purpose)}
      </Badge>
    </VStack>
  </HStack>
)

export const TripsMobileList = ({
  data,
  isLoading,
  isError,
  onViewOrUpsertTrip,
  paginationProps,
  slots,
}: TripsMobileListProps) => {
  const renderItem = useCallback((trip: Trip) => <TripsMobileListItem trip={trip} />, [])

  return (
    <div className='Layer__TripsMobileList'>
      <PaginatedMobileList
        ariaLabel='Trips'
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        paginationProps={paginationProps}
        onClickItem={onViewOrUpsertTrip}
        slots={slots}
      />
    </div>
  )
}

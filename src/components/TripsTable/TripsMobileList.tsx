import { useCallback } from 'react'
import { Car } from 'lucide-react'

import { type Trip } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { MobileListDataState } from '@ui/MobileList/MobileListDataState'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize } from '@components/Badge/Badge'
import { DataStateStatus } from '@components/DataState/DataState'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsAddressCell } from '@components/TripsTable/TripsAddressCell'
import { formatDistance, getPurposeBadgeVariant, getPurposeLabel } from '@components/TripsTable/utils'

interface TripsMobileListProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  onEditTrip: (trip: Trip) => void
  paginationProps: TablePaginationProps
}

const TripsEmptyState = () => (
  <MobileListDataState
    status={DataStateStatus.allDone}
    title='No trips yet'
    description='Add your first trip to start tracking mileage.'
    icon={<Car />}
  />
)

const TripsErrorState = () => (
  <MobileListDataState
    status={DataStateStatus.failed}
    title="We couldn't load your trips"
    description='An error occurred while loading your trips. Please check your connection and try again.'
  />
)

const TripsMobileListItem = ({ trip }: { trip: Trip }) => (
  <HStack justify='space-between' gap='sm'>
    <VStack gap='3xs' overflow='auto'>
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
  onEditTrip,
  paginationProps,
}: TripsMobileListProps) => {
  const renderItem = useCallback((trip: Trip) => <TripsMobileListItem trip={trip} />, [])

  return (
    <PaginatedMobileList
      ariaLabel='Trips'
      data={data}
      isLoading={isLoading}
      isError={isError}
      renderItem={renderItem}
      paginationProps={paginationProps}
      onClickItem={onEditTrip}
      slots={{
        EmptyState: TripsEmptyState,
        ErrorState: TripsErrorState,
      }}
    />
  )
}

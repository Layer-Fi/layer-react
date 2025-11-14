import { Button } from '@ui/Button/Button'
import { useMemo, useState, useCallback } from 'react'
import { useListTrips } from '@features/trips/api/useListTrips'
import { type TripEncoded, type TripPurpose } from '@schemas/trip'
import { formatDate } from '@utils/format'
import type { ColumnConfig } from '@components/DataTable/DataTable'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'
import { Span } from '@ui/Typography/Text'
import ChevronRightFill from '@icons/ChevronRightFill'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Car, Plus } from 'lucide-react'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { Container } from '@components/Container/Container'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { TripForm } from '@components/Trips/TripForm/TripForm'
import { VStack, HStack } from '@ui/Stack/Stack'
import { formatDistance, getPurposeLabel } from './utils'
import './tripsTable.scss'
import { getVehicleDisplayName } from '@features/vehicles/util'
import { type VehicleEncoded } from '@schemas/vehicle'
import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
import { VehicleSelector } from '@features/vehicles/components/VehicleSelector'
import { TripPurposeToggle, TripPurposeFilterValue } from '@features/trips/components/TripPurposeToggle'

const COMPONENT_NAME = 'TripsTable'

enum TripColumns {
  TripDate = 'TripDate',
  Vehicle = 'Vehicle',
  Distance = 'Distance',
  Purpose = 'Purpose',
  Address = 'Address',
  Description = 'Description',
  Expand = 'Expand',
}

const getColumnConfig = (onSelectTrip: (trip: TripEncoded) => void): ColumnConfig<TripEncoded, TripColumns> => ({
  [TripColumns.TripDate]: {
    id: TripColumns.TripDate,
    header: 'Date',
    cell: row => formatDate(new Date(row.trip_date)),
  },
  [TripColumns.Vehicle]: {
    id: TripColumns.Vehicle,
    header: 'Vehicle',
    cell: row => <Span ellipsis withTooltip>{getVehicleDisplayName(row.vehicle)}</Span>,
    isRowHeader: true,
  },
  [TripColumns.Distance]: {
    id: TripColumns.Distance,
    header: 'Distance',
    cell: row => <Span align='right'>{formatDistance(row.distance)}</Span>,
  },
  [TripColumns.Purpose]: {
    id: TripColumns.Purpose,
    header: 'Purpose',
    cell: row => getPurposeLabel(row.purpose as TripPurpose),
  },
  [TripColumns.Address]: {
    id: TripColumns.Address,
    header: 'Address',
    cell: row => (
      <VStack gap='3xs' overflow='auto'>
        <Span ellipsis size='sm' withTooltip>
          <strong>Start:</strong>
          {' '}
          {row.start_address || '—'}
        </Span>
        <Span ellipsis size='sm' withTooltip>
          <strong>End:</strong>
          {' '}
          {row.end_address || '—'}
        </Span>
      </VStack>
    ),
  },
  [TripColumns.Description]: {
    id: TripColumns.Description,
    header: 'Description',
    cell: row => <Span ellipsis withTooltip>{row.description || '—'}</Span>,
  },
  [TripColumns.Expand]: {
    id: TripColumns.Expand,
    cell: row => (
      <Button inset icon onPress={() => onSelectTrip(row)} aria-label='View trip' variant='ghost'>
        <ChevronRightFill />
      </Button>
    ),
  },
})

export const TripsTable = () => {
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripEncoded | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleEncoded | null>(null)
  const [purposeFilter, setPurposeFilter] = useState<TripPurposeFilterValue>(TripPurposeFilterValue.All)

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })

  const filterParams = useMemo(() => {
    const params: { query?: string, vehicleId?: string, purpose?: string } = {}

    if (searchQuery) {
      params.query = searchQuery
    }

    if (selectedVehicle) {
      params.vehicleId = selectedVehicle.id
    }

    if (purposeFilter !== TripPurposeFilterValue.All) {
      params.purpose = purposeFilter
    }

    return params
  }, [searchQuery, selectedVehicle, purposeFilter])

  const { data, isLoading, isError, size, setSize } = useListTrips(filterParams)

  const trips = useMemo(() => data?.flatMap(({ data }) => data), [data])

  const paginationMeta = data?.[data.length - 1]?.meta.pagination
  const hasMore = paginationMeta?.has_more

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const onSelectTrip = useCallback((trip: TripEncoded) => {
    setSelectedTrip(trip)
    setIsTripDrawerOpen(true)
  }, [])

  const onRecordTrip = useCallback(() => {
    setSelectedTrip(null)
    setIsTripDrawerOpen(true)
  }, [])

  const onTripSuccess = useCallback((trip: TripEncoded) => {
    setIsTripDrawerOpen(false)
    setSelectedTrip(null)
    void trip
  }, [])

  const paginationProps = useMemo(() => {
    return {
      pageSize: 20,
      hasMore,
      fetchMore,
    }
  }, [fetchMore, hasMore])

  const PurposeToggle = useCallback(() => (
    <TripPurposeToggle
      selected={purposeFilter}
      onChange={setPurposeFilter}
    />
  ), [purposeFilter, setPurposeFilter])

  const VehicleFilter = useCallback(() => (
    <VehicleSelector
      selectedVehicle={selectedVehicle}
      onSelectedVehicleChange={setSelectedVehicle}
      placeholder='All vehicles'
      showLabel={false}
      className='Layer__TripsTable__VehicleSelector'
      inline
    />
  ), [selectedVehicle, setSelectedVehicle])

  const RecordTripButton = useCallback(() => (
    <Button onPress={onRecordTrip}>
      Record Trip
      <Plus size={16} />
    </Button>
  ), [onRecordTrip])

  const TripsTableEmptyState = () => (
    <DataState
      status={DataStateStatus.allDone}
      title='No trips yet'
      description='Add your first trip to start tracking mileage.'
      icon={<Car />}
      spacing
    />
  )

  const TripsTableErrorState = () => (
    <DataState
      status={DataStateStatus.failed}
      title="We couldn't load your trips"
      description='An error occurred while loading your trips. Please check your connection and try again.'
      spacing
    />
  )

  const columnConfig = useMemo(() => getColumnConfig(onSelectTrip), [onSelectTrip])

  const HeaderFilters = useCallback(() => (
    <HStack gap='sm' align='center'>
      <PurposeToggle />
      <VehicleFilter />
    </HStack>
  ), [VehicleFilter, PurposeToggle])

  return (
    <>
      <Container name='TripsTable'>
        <DataTableHeader
          name='Trips'
          slots={{
            HeaderActions: RecordTripButton,
            HeaderFilters,
          }}
          slotProps={{
            SearchField: {
              label: 'Search trips',
              value: inputValue,
              onChange: handleInputChange,
              className: 'Layer__TripsTable__SearchField',
            },
          }}
        />
        <PaginatedTable
          ariaLabel='Trips'
          data={trips}
          isLoading={isLoading}
          isError={isError}
          columnConfig={columnConfig}
          paginationProps={paginationProps}
          componentName={COMPONENT_NAME}
          slots={{
            EmptyState: TripsTableEmptyState,
            ErrorState: TripsTableErrorState,
          }}
        />
      </Container>
      <Drawer isOpen={isTripDrawerOpen} onOpenChange={setIsTripDrawerOpen} aria-label={selectedTrip ? 'Trip details' : 'Record trip'}>
        {({ close }) => (
          <VStack pb='lg'>
            <VStack pi='md'>
              <ModalTitleWithClose
                heading={(
                  <ModalHeading size='md'>
                    {selectedTrip ? 'Trip details' : 'Record trip'}
                  </ModalHeading>
                )}
                onClose={close}
              />
            </VStack>
            <TripForm
              trip={selectedTrip ?? undefined}
              onSuccess={(trip: TripEncoded) => {
                onTripSuccess(trip)
                close()
              }}
            />
          </VStack>
        )}
      </Drawer>
    </>
  )
}

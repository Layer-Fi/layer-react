import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Row } from '@tanstack/react-table'
import { getYear } from 'date-fns'
import { Car, Edit, Plus, Trash2 } from 'lucide-react'

import { type Trip, type TripPurpose } from '@schemas/trip'
import { type Vehicle } from '@schemas/vehicle'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { useAutoResetPageIndex } from '@hooks/pagination/useAutoResetPageIndex'
import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useCurrentTripsPage, useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripDeleteConfirmationModal } from '@components/Trips/TripDeleteConfirmationModal'
import { TripForm } from '@components/Trips/TripForm/TripForm'
import { useListTrips } from '@features/trips/api/useListTrips'
import { TripPurposeFilterValue, TripPurposeToggle } from '@features/trips/components/TripPurposeToggle'
import { VehicleSelector } from '@features/vehicles/components/VehicleSelector'
import { getVehicleDisplayName } from '@features/vehicles/util'

import './tripsTable.scss'

import { TripsTableHeaderMenu } from './TripsTableHeaderMenu'
import { formatDistance, getPurposeLabel } from './utils'

const COMPONENT_NAME = 'TripsTable'

enum TripColumns {
  TripDate = 'TripDate',
  Vehicle = 'Vehicle',
  Distance = 'Distance',
  Purpose = 'Purpose',
  Address = 'Address',
  Description = 'Description',
  Actions = 'Actions',
}

type TripActions = {
  onSelectTrip: (trip: Trip) => void
  onDeleteTrip: (trip: Trip) => void
}

type TripsRowType = Row<Trip>
const getColumnConfig = ({ onSelectTrip, onDeleteTrip }: TripActions): NestedColumnConfig<Trip> => [
  {
    id: TripColumns.TripDate,
    header: 'Date',
    cell: (row: TripsRowType) => formatCalendarDate(row.original.tripDate),
  },
  {
    id: TripColumns.Vehicle,
    header: 'Vehicle',
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{getVehicleDisplayName(row.original.vehicle)}</Span>,
    isRowHeader: true,
  },
  {
    id: TripColumns.Distance,
    header: 'Distance',
    cell: (row: TripsRowType) => <Span align='right'>{formatDistance(row.original.distance)}</Span>,
  },
  {
    id: TripColumns.Purpose,
    header: 'Purpose',
    cell: (row: TripsRowType) => getPurposeLabel(row.original.purpose as TripPurpose),
  },
  {
    id: TripColumns.Address,
    header: 'Address',
    cell: (row: TripsRowType) => {
      return (
        <VStack gap='3xs' overflow='auto'>
          {row.original.startAddress && (
            <Span ellipsis size='sm' withTooltip>
              <strong>Start:</strong>
              {' '}
              {row.original.startAddress}
            </Span>
          )}
          {row.original.endAddress && (
            <Span ellipsis size='sm' withTooltip>
              <strong>End:</strong>
              {' '}
              {row.original.endAddress}
            </Span>
          )}
        </VStack>
      )
    },
  },
  {
    id: TripColumns.Description,
    header: 'Description',
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{row.original.description}</Span>,
  },
  {
    id: TripColumns.Actions,
    cell: (row: TripsRowType) => (
      <HStack gap='3xs'>
        <Button inset icon onPress={() => onSelectTrip(row.original)} aria-label='View trip' variant='ghost'>
          <Edit size={20} />
        </Button>
        <Button inset icon onPress={() => onDeleteTrip(row.original)} aria-label='Delete trip' variant='ghost'>
          <Trash2 size={20} />
        </Button>
      </HStack>
    ),
  },
]

export const TripsTable = () => {
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)

  const { tableFilters, setTableFilters } = useTripsTableFilters()
  const { query, selectedVehicle, purposeFilter } = tableFilters
  const { currentTripsPage, setCurrentTripsPage } = useCurrentTripsPage()

  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const selectedYear = getYear(startDate)

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: query })

  useEffect(() => {
    setTableFilters({ query: searchQuery })
  }, [searchQuery, setTableFilters])

  const filterParams = useMemo(() => {
    const params: { query?: string, vehicleId?: string, purpose?: string, year?: number } = {}

    if (query) {
      params.query = query
    }

    if (selectedVehicle) {
      params.vehicleId = selectedVehicle.id
    }

    if (purposeFilter !== TripPurposeFilterValue.All) {
      params.purpose = purposeFilter
    }

    params.year = selectedYear

    return params
  }, [query, selectedVehicle, purposeFilter, selectedYear])

  const { data, isLoading, isError, size, setSize } = useListTrips(filterParams)
  const trips = useMemo(() => data?.flatMap(({ data }) => data), [data])
  const autoResetPageIndexRef = useAutoResetPageIndex(filterParams, data)

  const paginationMeta = data?.[data.length - 1]?.meta.pagination
  const hasMore = paginationMeta?.hasMore

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const onSelectTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip)
    setIsTripDrawerOpen(true)
  }, [])

  const onDeleteTrip = useCallback((trip: Trip) => {
    setTripToDelete(trip)
  }, [])

  const onRecordTrip = useCallback(() => {
    setSelectedTrip(null)
    setIsTripDrawerOpen(true)
  }, [])

  const paginationProps = useMemo(() => {
    return {
      initialPage: currentTripsPage,
      onSetPage: setCurrentTripsPage,
      pageSize: 20,
      hasMore,
      fetchMore,
      autoResetPageIndexRef,
    }
  }, [currentTripsPage, setCurrentTripsPage, fetchMore, hasMore, autoResetPageIndexRef])

  const handlePurposeFilterChange = useCallback((newPurposeFilter: TripPurposeFilterValue) => {
    setTableFilters({ purposeFilter: newPurposeFilter })
  }, [setTableFilters])

  const handleVehicleChange = useCallback((newVehicle: Vehicle | null) => {
    setTableFilters({ selectedVehicle: newVehicle })
  }, [setTableFilters])

  const PurposeToggle = useCallback(() => (
    <TripPurposeToggle
      selected={purposeFilter}
      onChange={handlePurposeFilterChange}
    />
  ), [purposeFilter, handlePurposeFilterChange])

  const VehicleFilter = useCallback(() => (
    <VehicleSelector
      selectedVehicle={selectedVehicle}
      onSelectedVehicleChange={handleVehicleChange}
      placeholder='All vehicles'
      showLabel={false}
      className='Layer__TripsTable__VehicleSelector'
      inline
    />
  ), [selectedVehicle, handleVehicleChange])

  const HeaderActions = useCallback(() => (
    <HStack gap='xs'>
      <Button onPress={onRecordTrip}>
        Record Trip
        <Plus size={16} />
      </Button>
      <TripsTableHeaderMenu />
    </HStack>
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

  const columnConfig = useMemo(() => getColumnConfig({ onSelectTrip, onDeleteTrip }), [onSelectTrip, onDeleteTrip])

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
            HeaderActions,
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
      <Drawer
        isOpen={isTripDrawerOpen}
        onOpenChange={setIsTripDrawerOpen}
        isDismissable
        aria-label={selectedTrip ? 'Trip details' : 'Record trip'}
      >
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
              onSuccess={() => {
                setSelectedTrip(null)
                close()
              }}
            />
          </VStack>
        )}
      </Drawer>
      {tripToDelete && (
        <TripDeleteConfirmationModal
          isOpen={!!tripToDelete}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setTripToDelete(null)
            }
          }}
          trip={tripToDelete}
        />
      )}
    </>
  )
}

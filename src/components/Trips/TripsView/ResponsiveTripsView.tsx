import { useCallback, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { Car } from 'lucide-react'

import type { Trip } from '@schemas/trip'
import { BREAKPOINTS } from '@config/general'
import { useAutoResetPageIndex } from '@hooks/pagination/useAutoResetPageIndex'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useCurrentTripsPage, useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { type DefaultVariant, ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TripDeleteConfirmationModal } from '@components/Trips/TripDeleteConfirmationModal/TripDeleteConfirmationModal'
import { TripDrawer } from '@components/Trips/TripDrawer/TripDrawer'
import { TripsMobileList } from '@components/Trips/TripsMobileList/TripsMobileList'
import { TripsTable } from '@components/Trips/TripsTable/TripsTable'
import { useListTrips } from '@features/trips/api/useListTrips'
import { TripPurposeFilterValue } from '@features/trips/components/TripPurposeToggle'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

const TripsViewEmptyState = () => (
  <DataState
    status={DataStateStatus.allDone}
    title='No trips yet'
    description='Add your first trip to start tracking mileage.'
    icon={<Car />}
    spacing
    className='Layer__TripsView__EmptyState'
  />
)

const TripsViewErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title="We couldn't load your trips"
    description='An error occurred while loading your trips. Please check your connection and try again.'
    spacing
    className='Layer__TripsView__ErrorState'
  />
)

export const ResponsiveTripsView = () => {
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)

  const { tableFilters } = useTripsTableFilters()
  const { query, selectedVehicle, purposeFilter } = tableFilters
  const { currentTripsPage, setCurrentTripsPage } = useCurrentTripsPage()

  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const selectedYear = getYear(startDate)

  const filterParams = useMemo(() => ({
    year: selectedYear,
    ...(query && { query }),
    ...(selectedVehicle && { vehicleId: selectedVehicle.id }),
    ...(purposeFilter !== TripPurposeFilterValue.All && { purpose: purposeFilter }),
  }), [query, selectedVehicle, purposeFilter, selectedYear])

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

  const onViewOrUpsertTrip = useCallback((trip: Trip | null) => {
    setSelectedTrip(trip)
    setIsTripDrawerOpen(true)
  }, [])

  const onDeleteTrip = useCallback((trip: Trip) => {
    setTripToDelete(trip)
  }, [])

  const paginationProps = useMemo(() => ({
    initialPage: currentTripsPage,
    onSetPage: setCurrentTripsPage,
    pageSize: 20,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [currentTripsPage, setCurrentTripsPage, fetchMore, hasMore, autoResetPageIndexRef])

  const DesktopViewTable = useMemo(() => (
    <TripsTable
      data={trips}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onDeleteTrip={onDeleteTrip}
      onViewOrUpsertTrip={onViewOrUpsertTrip}
      slots={{
        EmptyState: TripsViewEmptyState,
        ErrorState: TripsViewErrorState,
      }}
    />
  ), [trips, isLoading, isError, paginationProps, onViewOrUpsertTrip, onDeleteTrip])

  const MobileViewTable = useMemo(() => (
    <TripsMobileList
      data={trips}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onViewOrUpsertTrip={onViewOrUpsertTrip}
      slots={{
        EmptyState: TripsViewEmptyState,
        ErrorState: TripsViewErrorState,
      }}
    />
  ), [trips, isLoading, isError, onViewOrUpsertTrip, paginationProps])

  return (
    <>
      <ResponsiveComponent resolveVariant={resolveVariant} slots={{ Desktop: DesktopViewTable, Mobile: MobileViewTable }} />
      <TripDrawer
        isOpen={isTripDrawerOpen && !tripToDelete}
        onOpenChange={setIsTripDrawerOpen}
        trip={selectedTrip}
        onSuccess={() => setSelectedTrip(null)}
        onDeleteTrip={onDeleteTrip}
      />
      {tripToDelete && (
        <TripDeleteConfirmationModal
          isOpen={!!tripToDelete}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setTripToDelete(null)
            }
          }}
          trip={tripToDelete}
          onSuccess={() => {
            setSelectedTrip(null)
            setIsTripDrawerOpen(false)
          }}
        />
      )}
    </>
  )
}

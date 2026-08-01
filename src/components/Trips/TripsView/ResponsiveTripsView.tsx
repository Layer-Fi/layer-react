import { useCallback, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Trip } from '@schemas/trip'
import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useListTrips } from '@api/businesses/[business-id]/mileage/trips/get'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useGlobalDateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { useCurrentTripsPage, useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { TripDeleteConfirmationModal } from '@components/Trips/TripDeleteConfirmationModal/TripDeleteConfirmationModal'
import { TripDrawer } from '@components/Trips/TripDrawer/TripDrawer'
import { TripPurposeFilterValue } from '@components/Trips/TripPurposeToggle/TripPurposeToggle'
import { TripsMobileList } from '@components/Trips/TripsMobileList/TripsMobileList'
import { TripsTable } from '@components/Trips/TripsTable/TripsTable'
import { type DefaultVariant, ResponsiveComponent } from '@components/utility/ResponsiveComponent'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

const TripsViewEmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.allDone}
      title={t('trips:empty.no_trips_yet', 'No trips yet')}
      description={t('trips:empty.add_first_trip', 'Add your first trip to start tracking mileage.')}
      icon={<Car />}
      spacing
      className='Layer__TripsView__EmptyState'
    />
  )
}

const TripsViewErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('trips:error.load_trips', 'We couldn\'t load your trips')}
      description={t('trips:error.load_trips_error', 'An error occurred while loading your trips. Please check your connection and try again.')}
      spacing
      className='Layer__TripsView__ErrorState'
    />
  )
}

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

  const { data, flattenedData: trips, isLoading, isError, hasMore, fetchMore } = useListTrips(filterParams)

  const onViewOrUpsertTrip = useCallback((trip: Trip | null) => {
    setSelectedTrip(trip)
    setIsTripDrawerOpen(true)
  }, [])

  const onDeleteTrip = useCallback((trip: Trip) => {
    setTripToDelete(trip)
  }, [])

  const paginationProps = useTablePaginationProps({
    filterParams,
    data,
    pageSize: 20,
    hasMore,
    fetchMore,
    pageIndex: currentTripsPage,
    onPageIndexChange: setCurrentTripsPage,
  })

  const DesktopView = useMemo(() => (
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

  const onRecordTrip = useCallback(() => onViewOrUpsertTrip(null), [onViewOrUpsertTrip])

  const MobileView = useMemo(() => (
    <TripsMobileList
      data={trips}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onEditTrip={onViewOrUpsertTrip}
      onDeleteTrip={onDeleteTrip}
      onRecordTrip={onRecordTrip}
      slots={{
        EmptyState: TripsViewEmptyState,
        ErrorState: TripsViewErrorState,
      }}
    />
  ), [trips, isLoading, isError, onViewOrUpsertTrip, onDeleteTrip, onRecordTrip, paginationProps])

  return (
    <>
      <ResponsiveComponent resolveVariant={resolveVariant} slots={{ Desktop: DesktopView, Mobile: MobileView }} />
      <TripDrawer
        isOpen={isTripDrawerOpen && !tripToDelete}
        onOpenChange={setIsTripDrawerOpen}
        trip={selectedTrip}
        onSuccess={() => setSelectedTrip(null)}
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

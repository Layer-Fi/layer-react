import { useCallback, useMemo, useState } from 'react'
import { getYear } from 'date-fns'

import type { Trip } from '@schemas/trip'
import { BREAKPOINTS } from '@config/general'
import { useAutoResetPageIndex } from '@hooks/pagination/useAutoResetPageIndex'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useCurrentTripsPage, useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { type DefaultVariant, ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { Container } from '@components/Container/Container'
import { TripDeleteConfirmationModal } from '@components/Trips/TripDeleteConfirmationModal'
import { TripDrawer } from '@components/TripsTable/TripDrawer'
import { TripsMobileList } from '@components/TripsTable/TripsMobileList'
import { TripsTable } from '@components/TripsTable/TripsTable'
import { TripsTableHeader } from '@components/TripsTable/TripsTableHeader'
import { useListTrips } from '@features/trips/api/useListTrips'
import { TripPurposeFilterValue } from '@features/trips/components/TripPurposeToggle'

import './responsiveTripsView.scss'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

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

  const onEditTrip = useCallback((trip: Trip) => {
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

  const paginationProps = useMemo(() => ({
    initialPage: currentTripsPage,
    onSetPage: setCurrentTripsPage,
    pageSize: 20,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [currentTripsPage, setCurrentTripsPage, fetchMore, hasMore, autoResetPageIndexRef])

  const DesktopView = useMemo(() => (
    <TripsTable
      data={trips}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onEditTrip={onEditTrip}
      onDeleteTrip={onDeleteTrip}
    />
  ), [trips, isLoading, isError, paginationProps, onEditTrip, onDeleteTrip])

  const MobileView = useMemo(() => (
    <TripsMobileList
      data={trips}
      isLoading={isLoading}
      isError={isError}
      onEditTrip={onEditTrip}
      paginationProps={paginationProps}
    />
  ), [trips, isLoading, isError, onEditTrip, paginationProps])

  return (
    <>
      <Container name='TripsTable'>
        <TripsTableHeader onRecordTrip={onRecordTrip} />
        <ResponsiveComponent resolveVariant={resolveVariant} slots={{ Desktop: DesktopView, Mobile: MobileView }} />
      </Container>
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

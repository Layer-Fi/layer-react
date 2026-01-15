import { useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'

import type { Vehicle } from '@schemas/vehicle'
import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { TripsTableHeaderMenu } from '@components/Trips/TripsTable/TripsTableHeaderMenu'
import { type TripPurposeFilterValue, TripPurposeToggle } from '@features/trips/components/TripPurposeToggle'
import { VehicleSelector } from '@features/vehicles/components/VehicleSelector'

import './tripsTableHeader.scss'

interface TripsTableHeaderProps {
  onRecordTrip: () => void
}

export const TripsTableHeader = ({ onRecordTrip }: TripsTableHeaderProps) => {
  const { tableFilters, setTableFilters } = useTripsTableFilters()
  const { query, selectedVehicle, purposeFilter } = tableFilters

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: query })

  useEffect(() => {
    setTableFilters({ query: searchQuery })
  }, [searchQuery, setTableFilters])

  const handlePurposeFilterChange = useCallback((newPurposeFilter: TripPurposeFilterValue) => {
    setTableFilters({ purposeFilter: newPurposeFilter })
  }, [setTableFilters])

  const handleVehicleChange = useCallback((newVehicle: Vehicle | null) => {
    setTableFilters({ selectedVehicle: newVehicle })
  }, [setTableFilters])

  const PurposeToggle = useCallback(() => (
    <TripPurposeToggle selected={purposeFilter} onChange={handlePurposeFilterChange} />
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

  const HeaderFilters = useCallback(() => (
    <HStack gap='sm' align='center'>
      <PurposeToggle />
      <VehicleFilter />
    </HStack>
  ), [VehicleFilter, PurposeToggle])

  return (
    <DataTableHeader
      name='Trips'
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: 'Search trips',
          value: inputValue,
          onChange: handleInputChange,
          className: 'Layer__TripsTable__SearchField',
        },
      }}
    />
  )
}

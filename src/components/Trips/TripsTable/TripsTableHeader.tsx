import { useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Vehicle } from '@schemas/vehicle'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { type TripPurposeFilterValue, TripPurposeToggle } from '@components/Trips/TripPurposeToggle/TripPurposeToggle'
import { TripsTableHeaderMenu } from '@components/Trips/TripsTable/TripsTableHeaderMenu'
import { VehicleSelector } from '@components/VehicleManagement/VehicleSelector/VehicleSelector'

import './tripsTableHeader.scss'

interface TripsTableHeaderProps {
  onRecordTrip: () => void
}

export const TripsTableHeader = ({ onRecordTrip }: TripsTableHeaderProps) => {
  const { t } = useTranslation()
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
      placeholder={t('vehicles:label.all_vehicles', 'All vehicles')}
      showLabel={false}
      className='Layer__TripsTable__VehicleSelector'
      inline
    />
  ), [t, selectedVehicle, handleVehicleChange])

  const HeaderActions = useCallback(() => (
    <HStack gap='xs'>
      <Button onPress={onRecordTrip}>
        {t('trips:action.record_trip', 'Record Trip')}
        <Plus size={16} />
      </Button>
      <TripsTableHeaderMenu />
    </HStack>
  ), [t, onRecordTrip])

  const HeaderFilters = useCallback(() => (
    <HStack gap='sm' align='center'>
      <PurposeToggle />
      <VehicleFilter />
    </HStack>
  ), [VehicleFilter, PurposeToggle])

  return (
    <DataTableHeader
      name={t('trips:label.trips', 'Trips')}
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: t('trips:label.search_trips', 'Search trips'),
          value: inputValue,
          onChange: handleInputChange,
          className: 'Layer__TripsTable__SearchField',
        },
      }}
    />
  )
}

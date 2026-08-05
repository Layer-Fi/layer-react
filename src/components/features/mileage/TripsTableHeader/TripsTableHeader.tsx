import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TripPurposeFilterValue } from '@schemas/features/mileage/trip'
import type { Vehicle } from '@schemas/features/mileage/vehicle'
import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/features/mileage/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DataTableHeader } from '@blocks/Table/DataTable/DataTableHeader'
import { TripPurposeToggle } from '@features/mileage/TripPurposeToggle/TripPurposeToggle'
import { TripsHeaderMenu } from '@features/mileage/TripsHeaderMenu/TripsHeaderMenu'
import { VehicleSelector } from '@features/mileage/VehicleSelector/VehicleSelector'

import './tripsTableHeader.scss'

interface TripsTableHeaderProps {
  onRecordTrip: () => void
}

export const TripsTableHeader = ({ onRecordTrip }: TripsTableHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useTripsTableFilters()
  const { query, selectedVehicle, purposeFilter } = tableFilters

  const searchProps = useDebouncedSearchProps({ query, setTableFilters })

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
      placeholder={t('mileage:TripsTableHeader.label.all_vehicles', 'All vehicles')}
      showLabel={false}
      className='Layer__TripsTable__VehicleSelector'
      inline
    />
  ), [t, selectedVehicle, handleVehicleChange])

  const HeaderActions = useCallback(() => (
    <HStack gap='xs'>
      <Button onPress={onRecordTrip}>
        {t('mileage:TripsTableHeader.action.record_trip', 'Record Trip')}
        <Plus size={16} />
      </Button>
      <TripsHeaderMenu />
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
      name={t('mileage:TripsTableHeader.label.trips', 'Trips')}
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: t('mileage:TripsTableHeader.label.search_trips', 'Search trips'),
          className: 'Layer__TripsTable__SearchField',
          ...searchProps,
        },
      }}
    />
  )
}

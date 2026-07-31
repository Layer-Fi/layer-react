import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DataTableHeader } from '@blocks/DataTable/DataTableHeader'
import { type TripPurposeFilterValue, TripPurposeToggle } from '@features/mileage/Trips/TripPurposeToggle/TripPurposeToggle'
import { TripsTableHeaderMenu } from '@features/mileage/Trips/TripsTable/TripsTableHeaderMenu'

interface TripsMobileHeaderProps {
  onRecordTrip: () => void
}

export const TripsMobileHeader = ({ onRecordTrip }: TripsMobileHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useTripsTableFilters()
  const { query, purposeFilter } = tableFilters

  const searchProps = useDebouncedSearchProps({ query, setTableFilters })

  const handlePurposeFilterChange = useCallback((newPurposeFilter: TripPurposeFilterValue) => {
    setTableFilters({ purposeFilter: newPurposeFilter })
  }, [setTableFilters])

  const HeaderActions = useCallback(() => (
    <HStack align='center' gap='xs'>
      <Button onPress={onRecordTrip}>
        {t('trips:action.record_trip', 'Record Trip')}
        <Plus size={16} />
      </Button>
      <TripsTableHeaderMenu />
    </HStack>
  ), [t, onRecordTrip])

  const HeaderFilters = useCallback(() => (
    <TripPurposeToggle
      selected={purposeFilter}
      onChange={handlePurposeFilterChange}
      fullWidth
    />
  ), [purposeFilter, handlePurposeFilterChange])

  return (
    <DataTableHeader
      isMobile
      name={t('trips:label.trips', 'Trips')}
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: t('trips:label.search_trips', 'Search trips'),
          ...searchProps,
        },
      }}
    />
  )
}

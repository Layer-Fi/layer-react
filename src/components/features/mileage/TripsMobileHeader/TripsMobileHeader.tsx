import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TripPurposeFilterValue } from '@schemas/features/mileage/trip'
import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/features/mileage/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DataTableHeader } from '@blocks/Table/DataTable/DataTableHeader'
import { TripPurposeToggle } from '@features/mileage/TripPurposeToggle/TripPurposeToggle'
import { TripsHeaderMenu } from '@features/mileage/TripsHeaderMenu/TripsHeaderMenu'

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
        {t('mileage:TripsMobileHeader.action.record_trip', 'Record Trip')}
        <Plus size={16} />
      </Button>
      <TripsHeaderMenu />
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
      name={t('mileage:TripsMobileHeader.label.trips', 'Trips')}
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: t('mileage:TripsMobileHeader.label.search_trips', 'Search trips'),
          ...searchProps,
        },
      }}
    />
  )
}

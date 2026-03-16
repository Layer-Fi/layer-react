import { useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@ui/Typography/Text'
import { SearchField } from '@components/SearchField/SearchField'
import { type TripPurposeFilterValue, TripPurposeToggle } from '@components/Trips/TripPurposeToggle/TripPurposeToggle'
import { TripsTableHeaderMenu } from '@components/Trips/TripsTable/TripsTableHeaderMenu'

import './tripsMobileHeader.scss'

interface TripsMobileHeaderProps {
  onRecordTrip: () => void
}

export const TripsMobileHeader = ({ onRecordTrip }: TripsMobileHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useTripsTableFilters()
  const { query, purposeFilter } = tableFilters

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: query })

  useEffect(() => {
    setTableFilters({ query: searchQuery })
  }, [searchQuery, setTableFilters])

  const handlePurposeFilterChange = useCallback((newPurposeFilter: TripPurposeFilterValue) => {
    setTableFilters({ purposeFilter: newPurposeFilter })
  }, [setTableFilters])

  return (
    <Header className='Layer__TripsMobileHeader'>
      <VStack gap='sm'>
        <Heading size='lg'>{t('trips:trips', 'Trips')}</Heading>

        <HStack align='center' gap='xs'>
          <TripPurposeToggle
            selected={purposeFilter}
            onChange={handlePurposeFilterChange}
            fullWidth
          />
          <TripsTableHeaderMenu />
        </HStack>

        <HStack gap='xs' align='center' pbe='md'>
          <SearchField
            label={t('trips:searchTrips', 'Search trips')}
            value={inputValue}
            onChange={handleInputChange}
            className='Layer__TripsMobileHeader__SearchField'
          />
          <Button onPress={onRecordTrip}>
            {t('trips:recordTrip', 'Record Trip')}
            <Plus size={16} />
          </Button>
        </HStack>

      </VStack>
    </Header>
  )
}

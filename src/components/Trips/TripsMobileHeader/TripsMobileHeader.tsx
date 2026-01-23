import { useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'

import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
import { useTripsTableFilters } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@ui/Typography/Text'
import { SearchField } from '@components/SearchField/SearchField'
import { TripsTableHeaderMenu } from '@components/Trips/TripsTable/TripsTableHeaderMenu'
import { type TripPurposeFilterValue, TripPurposeToggle } from '@features/trips/components/TripPurposeToggle'

import './tripsMobileHeader.scss'

interface TripsMobileHeaderProps {
  onRecordTrip: () => void
}

export const TripsMobileHeader = ({ onRecordTrip }: TripsMobileHeaderProps) => {
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
        <Heading size='lg'>Trips</Heading>

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
            label='Search trips'
            value={inputValue}
            onChange={handleInputChange}
            className='Layer__TripsMobileHeader__SearchField'
          />
          <Button onPress={onRecordTrip}>
            Record Trip
            <Plus size={16} />
          </Button>
        </HStack>

      </VStack>
    </Header>
  )
}

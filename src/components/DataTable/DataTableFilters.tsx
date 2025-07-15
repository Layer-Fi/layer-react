import { Badge, BadgeVariant } from '../Badge'
import { BadgeSize } from '../Badge/Badge'
import { BadgeLoader } from '../BadgeLoader'
import { SearchField, type SearchFieldProps } from '../SearchField/SearchField'
import { Button } from '../ui/Button/Button'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'

interface CountProps {
  showCount?: true
  totalCount?: string
}

interface ClearFiltersProps {
  showClearFilters?: true
  onClearFilters: () => void
}
interface DataTableFiltersProps {
  name: string
  slotProps?: {
    count?: CountProps
    search?: SearchFieldProps
    clearFilters?: ClearFiltersProps
  }
  slots?: {
    HeaderActions?: React.FC
    HeaderFilters?: React.FC
    Filters?: React.FC
  }
}

export const DataTableFilters = ({ name, slotProps = {}, slots = {} }: DataTableFiltersProps) => {
  const { count, search, clearFilters } = slotProps
  const { showCount, totalCount } = count ?? {}
  const { showClearFilters, onClearFilters } = clearFilters ?? {}
  const { Filters, HeaderActions, HeaderFilters } = slots

  return (
    <VStack>
      <HStack justify='space-between' align='center' className='Layer__DataTable__Header'>
        <HStack pis='md' align='center' gap='xl'>
          <HStack align='center' gap='sm'>
            <Span weight='bold' size='lg'>{name}</Span>
            {showCount && (totalCount
              ? <Badge variant={BadgeVariant.DEFAULT} size={BadgeSize.MEDIUM}>{totalCount}</Badge>
              : <BadgeLoader />
            )}
          </HStack>
          {HeaderFilters && <HeaderFilters />}
        </HStack>
        <HStack pie='md' align='center' gap='3xs'>
          {search && <SearchField {...search} />}
          {HeaderActions && <HeaderActions />}
        </HStack>
      </HStack>
      {Filters && (
        <HStack pis='md' pie='md' justify='space-between' align='center' className='Layer__DataTable__Filters'>
          <Filters />
          {showClearFilters && <Button variant='outlined' onClick={onClearFilters}>Clear All Filters</Button>}
        </HStack>
      )}
    </VStack>
  )
}

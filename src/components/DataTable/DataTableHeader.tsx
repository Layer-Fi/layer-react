import { Button } from '@ui/Button/Button'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { BadgeSize } from '@components/Badge/Badge'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { SearchField, type SearchFieldProps } from '@components/SearchField/SearchField'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import './dataTableHeader.scss'

interface CountProps {
  showCount?: true
  totalCount?: string
}

interface ClearFiltersButtonProps {
  onClick: () => void
}
interface DataTableHeaderProps {
  name: string
  count?: CountProps
  slotProps?: {
    SearchField?: SearchFieldProps
    ClearFiltersButton?: ClearFiltersButtonProps
  }
  slots?: {
    HeaderActions?: React.FC
    HeaderFilters?: React.FC
    Filters?: React.FC
  }
}

export const DataTableHeader = ({ name, count, slotProps = {}, slots = {} }: DataTableHeaderProps) => {
  const { showCount, totalCount } = count ?? {}
  const { Filters, HeaderActions, HeaderFilters } = slots

  return (
    <VStack>
      <HStack justify='space-between' align='center' className='Layer__DataTableHeader__Header'>
        <HStack pis='md' align='center' gap='xl'>
          <HStack align='center' gap='sm'>
            <Span weight='bold' size='md'>{name}</Span>
            {showCount && (totalCount
              ? <Badge variant={BadgeVariant.DEFAULT} size={BadgeSize.MEDIUM}>{totalCount}</Badge>
              : <BadgeLoader />
            )}
          </HStack>
          {HeaderFilters && <HeaderFilters />}
        </HStack>
        <HStack pie='md' align='center' gap='xs'>
          {slotProps.SearchField && <SearchField {...slotProps.SearchField} />}
          {HeaderActions && <HeaderActions />}
        </HStack>
      </HStack>
      {Filters && (
        <HStack pis='md' pie='md' justify='space-between' align='center' className='Layer__DataTableHeader__Filters'>
          <Filters />
          {slotProps.ClearFiltersButton && (
            <Button variant='outlined' {...slotProps.ClearFiltersButton}>
              Clear All Filters
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  )
}

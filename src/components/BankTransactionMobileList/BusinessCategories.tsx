import { useCallback, useMemo, useState } from 'react'
import { ActionableList } from '../ActionableList'
import { Option, flattenCategories, flattenOptionGroups } from './utils'
import { useCategories } from '../../hooks/categories/useCategories'
import { HStack, VStack } from '../ui/Stack/Stack'
import { SearchField } from '../SearchField/SearchField'
import { Span } from '../ui/Typography/Text'
import { Button } from '../ui/Button/Button'
import { ChevronLeft } from 'lucide-react'

export interface BusinessCategoriesProps {
  select: (category: Option) => void
  selectedId?: string
  showTooltips: boolean
}

export const BusinessCategories = ({
  select,
  selectedId,
  showTooltips,
}: BusinessCategoriesProps) => {
  const { data: categories } = useCategories()
  const [query, setQuery] = useState('')

  const categoryOptions = flattenCategories(
    (categories ?? []).filter(category => category.type != 'ExclusionNested'),
  )

  const [optionsToShow, setOptionsToShow] = useState(categoryOptions)
  const [selectedGroup, setSelectedGroup] = useState<string>()

  const filteredOptions = useMemo(() => {
    if (!query) return optionsToShow

    const lower = query.toLowerCase()
    const flattenedOptions = flattenOptionGroups(optionsToShow)

    return flattenedOptions.filter(opt =>
      opt.label.toLowerCase().includes(lower),
    )
  }, [optionsToShow, query])

  const onCategorySelect = (v: Option) => {
    if (v.value.type === 'GROUP' && v.value.items) {
      setOptionsToShow(v.value.items)
      setSelectedGroup(v.label)
      return
    }
    select(v)
  }

  const clearSelectedGroup = useCallback(() => {
    setOptionsToShow(categoryOptions)
    setSelectedGroup(undefined)
  }, [categoryOptions])

  return (
    <VStack className='Layer__bank-transaction-mobile-list-item__categories_list-container' pbs='lg' gap='md'>
      <VStack pis='sm' pie='sm' gap='md'>
        <HStack pis='xs'>
          {selectedGroup
            ? (
              <Button variant='text' onClick={clearSelectedGroup}>
                <ChevronLeft size={18} />
                <Span size='lg' weight='bold' align='center'>
                  {selectedGroup}
                </Span>
              </Button>
            )
            : <Span size='lg'weight='bold'>Select category</Span>}
        </HStack>
        <SearchField value={query} onChange={setQuery} label='Search categories...' />
      </VStack>
      <ActionableList<Option['value']>
        options={filteredOptions}
        onClick={onCategorySelect}
        selectedId={selectedId}
        showDescriptions={showTooltips}
        className='Layer__bank-transaction-mobile-list-item__categories_list'
      />
    </VStack>
  )
}

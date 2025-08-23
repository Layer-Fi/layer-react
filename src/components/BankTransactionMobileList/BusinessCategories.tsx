import { useCallback, useMemo, useState } from 'react'
import { ActionableList } from '../ActionableList'
import { Option, flattenCategories, flattenOptionGroups } from './utils'
import { useCategories } from '../../hooks/categories/useCategories'
import { HStack, VStack } from '../ui/Stack/Stack'
import { SearchField } from '../SearchField/SearchField'
import { Button } from '../ui/Button/Button'
import { ChevronLeft } from 'lucide-react'
import { ModalHeading } from '../ui/Modal/ModalSlots'

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
    let options = optionsToShow

    if (query) {
      const lower = query.toLowerCase()
      const flattenedOptions = flattenOptionGroups(options)

      options = flattenedOptions.filter(opt =>
        opt.label.toLowerCase().includes(lower),
      )
    }

    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [optionsToShow, query])

  const onCategorySelect = (v: Option) => {
    if (v.value.type === 'GROUP' && v.value.items) {
      setOptionsToShow(v.value.items)
      setSelectedGroup(v.label)
      setQuery('')
      return
    }
    select(v)
  }

  const clearSelectedGroup = useCallback(() => {
    setOptionsToShow(categoryOptions)
    setSelectedGroup(undefined)
    setQuery('')
  }, [categoryOptions])

  return (
    <VStack className='Layer__bank-transaction-mobile-list-item__categories_list-container' pbs='lg' gap='md'>
      <VStack pis='sm' pie='sm' gap='md'>
        <HStack pis='xs'>
          {selectedGroup
            ? (
              <Button variant='text' onClick={clearSelectedGroup}>
                <ChevronLeft size={18} />
                <ModalHeading size='sm' weight='bold' align='center'>
                  {selectedGroup}
                </ModalHeading>
              </Button>
            )
            : <ModalHeading size='sm' weight='bold'>Select category</ModalHeading>}
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

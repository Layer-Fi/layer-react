import { useCallback, useMemo, useState } from 'react'
import { ActionableList } from '../ActionableList'
import { flattenCategories, type CategoryGroup } from './utils'
import { useCategories } from '../../hooks/categories/useCategories'
import { HStack, VStack } from '../ui/Stack/Stack'
import { SearchField } from '../SearchField/SearchField'
import { Button } from '../ui/Button/Button'
import { ChevronLeft } from 'lucide-react'
import { ModalHeading } from '../ui/Modal/ModalSlots'
import type { BankTransactionCategoryComboBoxOption, CategoryAsOption } from '../BankTransactionCategoryComboBox/options'

export interface BusinessCategoriesProps {
  select: (category: BankTransactionCategoryComboBoxOption | null) => void
  selectedId?: string
  showTooltips: boolean
}

const isGroup = (item: CategoryGroup | CategoryAsOption): item is CategoryGroup => {
  return 'categories' in item
}

export const BusinessCategories = ({
  select,
  selectedId,
  showTooltips,
}: BusinessCategoriesProps) => {
  const { data: categories } = useCategories()
  const [query, setQuery] = useState('')

  const categoryOptions = useMemo(() =>
    flattenCategories(
      (categories ?? []).filter(category => category.type != 'ExclusionNested'),
    ),
  [categories])

  const [optionsToShow, setOptionsToShow] = useState<Array<CategoryGroup | CategoryAsOption>>(categoryOptions)
  const [selectedGroup, setSelectedGroup] = useState<string>()

  const filteredOptions = useMemo(() => {
    let options = optionsToShow

    if (query) {
      const lower = query.toLowerCase()

      options = options.flatMap((opt) => {
        if (isGroup(opt)) {
          // Search within group categories
          return opt.categories.filter(cat =>
            cat.label.toLowerCase().includes(lower),
          )
        }
        // Filter individual categories
        return opt.label.toLowerCase().includes(lower) ? [opt] : []
      })
    }

    return options
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(opt => isGroup(opt)
        ? { label: opt.label, id: opt.id, value: opt, asLink: true }
        : { label: opt.label, id: opt.value, description: opt.original.description ?? undefined, value: opt })
  }, [optionsToShow, query])

  const onCategorySelect = (item: { value: CategoryGroup | CategoryAsOption }) => {
    if (isGroup(item.value)) {
      setOptionsToShow(item.value.categories)
      setSelectedGroup(item.value.label)
      setQuery('')
      return
    }
    select(item.value)
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
      <ActionableList<CategoryAsOption | CategoryGroup>
        options={filteredOptions}
        onClick={onCategorySelect}
        selectedId={selectedId}
        showDescriptions={showTooltips}
        className='Layer__bank-transaction-mobile-list-item__categories_list'
      />
    </VStack>
  )
}

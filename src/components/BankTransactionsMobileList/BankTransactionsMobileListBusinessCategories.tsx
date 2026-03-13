import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategoryAsOption } from '@internal-types/categorizationOption'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { VStack } from '@ui/Stack/Stack'
import { ActionableList } from '@components/ActionableList/ActionableList'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type CategoryGroup, flattenCategories } from '@components/BankTransactionsMobileList/utils'
import { SearchField } from '@components/SearchField/SearchField'

export interface BankTransactionsMobileListBusinessCategoriesProps {
  select: (category: BankTransactionCategoryComboBoxOption | null) => void
  selectedId?: string
  showTooltips: boolean
  setSelectedGroup: (prevState: CategoryGroup | null) => void
  selectedGroup: CategoryGroup | null
}

const isGroup = (item: CategoryGroup | CategoryAsOption): item is CategoryGroup => {
  return 'categories' in item
}

export const BankTransactionsMobileListBusinessCategories = ({
  select,
  selectedId,
  showTooltips,
  setSelectedGroup,
  selectedGroup,
}: BankTransactionsMobileListBusinessCategoriesProps) => {
  const { t } = useTranslation()
  const { data: categories } = useCategories()
  const [query, setQuery] = useState('')

  const categoryOptions = useMemo(() => {
    if (selectedGroup) return selectedGroup.categories
    return flattenCategories(
      (categories ?? []).filter(category => category.type != 'ExclusionNested'),
    )
  }, [categories, selectedGroup])

  const filteredOptions = useMemo(() => {
    let options = categoryOptions

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
  }, [categoryOptions, query])

  const onCategorySelect = (item: { value: CategoryGroup | CategoryAsOption }) => {
    if (isGroup(item.value)) {
      setSelectedGroup(item.value)
      setQuery('')
      return
    }
    select(item.value)
  }

  return (
    <VStack className='Layer__bank-transaction-mobile-list-item__categories_list-container' pb='md' gap='md'>
      <SearchField value={query} onChange={setQuery} label={t('searchCategories', 'Search categories...')} />
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

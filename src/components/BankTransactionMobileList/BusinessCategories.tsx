import { useState } from 'react'
import { ActionableList } from '../ActionableList'
import { Text, TextWeight } from '../Typography'
import { Option, flattenCategories } from './utils'
import { useCategories } from '../../hooks/categories/useCategories'

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

  const categoryOptions = flattenCategories(
    (categories ?? []).filter(category => category.type != 'ExclusionNested'),
  )

  const [optionsToShow, setOptionsToShow] = useState(categoryOptions)
  const [selectedGroup, setSelectedGroup] = useState<string>()

  const onCategorySelect = (v: Option) => {
    if (v.value.type === 'GROUP' && v.value.items) {
      setOptionsToShow(v.value.items)
      setSelectedGroup(v.label)
      return
    }
    select(v)
  }

  return (
    <div className='Layer__bank-transaction-mobile-list-item__categories_list-container'>
      <Text
        weight={TextWeight.bold}
        className='Layer__bank-transaction-mobile-list-item__categories_list-title'
      >
        {selectedGroup ?? 'Select category'}
      </Text>
      <ActionableList<Option['value']>
        options={optionsToShow}
        onClick={onCategorySelect}
        selectedId={selectedId}
        showDescriptions={showTooltips}
      />
    </div>
  )
}

import React, { useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { ActionableList } from '../ActionableList'
import { Text, TextWeight } from '../Typography'
import { Option, flattenCategories } from './utils'

export interface BusinessCategoriesProps {
  select: (category: Option) => void
}

export const BusinessCategories = ({ select }: BusinessCategoriesProps) => {
  const { categories } = useLayerContext()

  const categoryOptions = flattenCategories(categories)

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
      />
    </div>
  )
}

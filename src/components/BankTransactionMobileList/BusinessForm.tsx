import React, { useState } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { BankTransaction, Category } from '../../types'
import { ActionableList, ActionableListOption } from '../ActionableList'
import {
  CategoryOption,
  OptionActionType,
} from '../CategorySelect/CategorySelect'

interface BusinessFormProps {
  bankTransaction: BankTransaction
}

const mapCategoryToOption = (category: Category) => ({
  type: OptionActionType.CATEGORY,
  payload: {
    id: category.id,
    option_type: OptionActionType.CATEGORY,
    display_name: category.display_name,
    type: category.type,
    stable_name: category.stable_name,
    entries: category.entries,
    subCategories: category.subCategories,
  },
})

const flattenCategories = (
  categories: Category[],
): ActionableListOption<CategoryOption[]>[] => {
  const categoryOptions = (categories || []).flatMap(category => {
    if (category?.subCategories && category?.subCategories?.length > 0) {
      if (category?.subCategories?.every(c => c.subCategories === undefined)) {
        return [
          {
            label: category.display_name,
            value: category.subCategories.map(x => mapCategoryToOption(x)),
          },
        ]
      }
      return flattenCategories(category.subCategories)
    }

    const resultOption = {
      label: category.display_name,
      value: [mapCategoryToOption(category)],
    } satisfies ActionableListOption<CategoryOption[]>
    return [resultOption]
  })

  return categoryOptions
}

export const BusinessForm = ({ bankTransaction }: BusinessFormProps) => {
  const { categories } = useLayerContext()
  const [selectedCategory, setSelectedCategory] =
    useState<ActionableListOption<CategoryOption[]>>()

  const categoryOptions = flattenCategories(categories)

  console.log('selectedCategory - open drawer with options', selectedCategory)

  return (
    <div className='Layer__bank-transaction-mobile-list-item__business-form'>
      <ActionableList<CategoryOption[]>
        options={categoryOptions}
        onClick={setSelectedCategory}
      />
    </div>
  )
}

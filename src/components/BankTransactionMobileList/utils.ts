import { BankTransaction, CategorizationStatus, Category } from '../../types'
import {
  CategoryOptionPayload,
  OptionActionType,
} from '../CategorySelect/CategorySelect'
import { PersonalCategories } from './constants'

export interface Option {
  label: string
  id: string
  value: {
    type: 'CATEGORY' | 'SELECT_CATEGORY' | 'GROUP'
    payload?: CategoryOptionPayload
    items?: Option[]
  }
  asLink?: boolean
  secondary?: boolean
}

export const mapCategoryToOption = (category: Category): Option => ({
  label: category.display_name,
  id: category.id,
  value: {
    type: 'CATEGORY',
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      stable_name: category.stable_name,
      entries: category.entries,
      subCategories: category.subCategories,
    },
  },
})

export const flattenCategories = (categories: Category[]): Option[] => {
  const categoryOptions = (categories || []).flatMap(category => {
    if (category?.subCategories && category?.subCategories?.length > 0) {
      if (category?.subCategories?.every(c => c.subCategories === undefined)) {
        return [
          {
            label: category.display_name,
            id: category.id,
            value: {
              type: 'GROUP',
              items: category.subCategories.map(x => mapCategoryToOption(x)),
            },
          } satisfies Option,
        ]
      }
      return flattenCategories(category.subCategories)
    }

    const resultOption = mapCategoryToOption(category) satisfies Option
    return [resultOption]
  })

  return categoryOptions
}

export const getAssignedValue = (
  bankTransaction: BankTransaction,
): Option | undefined => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED ||
    bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return
  }

  if (
    bankTransaction.category &&
    !PersonalCategories.includes(bankTransaction.category.display_name)
  ) {
    return mapCategoryToOption(bankTransaction.category)
  }

  return
}

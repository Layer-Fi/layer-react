import {
  BankTransaction,
  CategorizationStatus,
  Category,
  SuggestedCategorization,
} from '../../types'
import { hasSuggestions } from '../../types/categories'
import {
  CategoryOptionPayload,
  OptionActionType,
} from '../CategorySelect/CategorySelect'

export interface Option {
  label: string
  id: string
  description?: string
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
  description: category.description ?? undefined,
  value: {
    type: 'CATEGORY',
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      description: category.description ?? undefined,
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
            asLink: true,
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
    bankTransaction.category.type != 'Exclusion'
  ) {
    return mapCategoryToOption(bankTransaction.category)
  }

  if (hasSuggestions(bankTransaction.categorization_flow)) {
    const firstSuggestion = (
      bankTransaction.categorization_flow as SuggestedCategorization
    ).suggestions[0]
    return mapCategoryToOption(firstSuggestion)
  }

  return
}

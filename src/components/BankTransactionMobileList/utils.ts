import {
  BankTransaction,
  CategorizationStatus,
} from '../../types'
import type { CategoryWithEntries } from '../../types/bank_transactions'
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

export const mapCategoryToOption = (category: CategoryWithEntries): Option => ({
  label: category.display_name,
  id: ('id' in category) ? category.id : category.stable_name,
  description: category.description ?? undefined,
  value: {
    type: 'CATEGORY',
    payload: {
      id: ('id' in category) ? category.id : '',
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      description: category.description ?? undefined,
      stable_name: ('stable_name' in category) ? category.stable_name ?? '' : '',
      entries: category.entries,
      subCategories: category.subCategories,
    },
  },
})

export const flattenCategories = (categories: CategoryWithEntries[]): Option[] => {
  const visit = (cat: CategoryWithEntries): Option[] => {
    const subCategories = cat.subCategories

    if (!subCategories || subCategories.length === 0) return [mapCategoryToOption(cat)]

    if (subCategories.every(subCategory => !subCategory.subCategories || subCategory.subCategories.length === 0)) {
      return [
        {
          label: cat.display_name,
          id: 'id' in cat ? cat.id : cat.stable_name,
          asLink: true,
          value: {
            type: 'GROUP',
            items: subCategories.flatMap(visit),
          },
        } satisfies Option,
      ]
    }

    return subCategories.flatMap(visit)
  }

  return (categories).flatMap(visit)
}

export const flattenOptionGroups = (options: Option[]): Option[] => {
  return options.flatMap(opt =>
    opt.value?.type === 'GROUP' && Array.isArray(opt.value.items)
      ? flattenOptionGroups(opt.value.items)
      : [opt],
  )
}

export const getAssignedValue = (
  bankTransaction: BankTransaction,
): Option | undefined => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    || bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return
  }

  if (
    bankTransaction.category
    && bankTransaction.category.type != 'ExclusionNested'
  ) {
    return mapCategoryToOption(bankTransaction.category)
  }

  if (hasSuggestions(bankTransaction.categorization_flow)) {
    const firstSuggestion = (
      bankTransaction.categorization_flow
    ).suggestions[0]
    return mapCategoryToOption(firstSuggestion)
  }

  return
}

import { BankTransaction, CategorizationType, Category } from '../../types'
import { CategoryWithEntries, SuggestedMatch } from '../../types/bank_transactions'
import { CategoryOption, OptionActionType } from './types'

export function flattenCategories(
  categories: Category[],
) {
  function getLeafCategories(category: Category): Category[] {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category]
    }
    return category.subCategories.flatMap(subCategory =>
      getLeafCategories(subCategory),
    )
  }
  return categories.map((category) => {
    return {
      label: category.display_name,
      options: getLeafCategories(category).map(x => mapCategoryToOption(x)),
    }
  })
}

export const getKeysMap = (categories: CategoryOption[], accKeysMap?: Map<string, CategoryOption>) => {
  const keysMap = accKeysMap ?? new Map<string, CategoryOption>()

  categories.forEach((category) => {
    keysMap.set(category.payload.id, category)
    if (category.payload.subCategories) {
      getKeysMap(category.payload.subCategories, keysMap)
    }
  })

  return keysMap
}

export function mapCategoryToOption(category: CategoryWithEntries): CategoryOption {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: 'id' in category ? category.id : '',
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: category.type,
      description: category.description ?? undefined,
      stable_name: ('stable_name' in category) ? category.stable_name ?? '' : '',
      entries: category.entries,
      subCategories: category.subCategories?.map(x => mapCategoryToOption(x)) ?? null,
    },
  }
}

export function mapCategoryToExclusionOption(category: CategoryWithEntries & { type: 'ExclusionNested' }): CategoryOption {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: 'ExclusionNested',
      stable_name: '',
      entries: category.entries,
      subCategories: category.subCategories?.map(x => mapCategoryToOption(x)) ?? null,
    },
  }
}

export function mapSuggestedMatchToOption(record: SuggestedMatch): CategoryOption {
  return {
    type: OptionActionType.MATCH,
    payload: {
      id: record.id,
      option_type: OptionActionType.MATCH,
      display_name: record.details.description,
      amount: record.details.amount,
      subCategories: null,
    },
  }
}

export function buildMatchOptions(bankTransaction: BankTransaction, excludeMatches?: boolean) {
  if (excludeMatches || !bankTransaction?.suggested_matches) {
    return
  }

  return bankTransaction.suggested_matches.map((x) => {
    return {
      type: OptionActionType.MATCH,
      payload: {
        id: x.id,
        option_type: OptionActionType.MATCH,
        display_name: x.details.description,
        date: x.details.date,
        amount: x.details.amount,
        subCategories: null,
      },
    } satisfies CategoryOption
  })
}

export function buildSuggestedOptions(bankTransaction: BankTransaction) {
  if (bankTransaction?.categorization_flow?.type === CategorizationType.ASK_FROM_SUGGESTIONS) {
    return bankTransaction.categorization_flow.suggestions.map(x => mapCategoryToOption(x))
  }

  return
}

export function buildAllCategories(categories: Category[]) {
  return categories.map((category) => {
    return {
      label: category.display_name,
      options: [mapCategoryToOption(category)],
    }
  })
}

export function findParentCategory(categories: Category[], targetCategory: string): Category | null {
  function searchInCategory(category: Category): Category | null {
    if (category.subCategories) {
      for (const subCategory of category.subCategories) {
        if ('id' in subCategory && subCategory.id === targetCategory) {
          return category
        }
      }

      for (const subCategory of category.subCategories) {
        const result = searchInCategory(subCategory)
        if (result) {
          return result
        }
      }
    }

    return null
  }

  for (const category of categories) {
    if ('id' in category && category.id === targetCategory) {
      return null
    }

    const result = searchInCategory(category)
    if (result) {
      return result
    }
  }

  return null
}

export function isSelected(option: CategoryOption, selected?: CategoryOption) {
  if (!selected) {
    return false
  }

  return ('id' in option.payload && option.payload.id && option.payload.id === selected?.payload.id)
    || ('stable_name' in option.payload && option.payload.stable_name && option.payload.stable_name === selected?.payload.stable_name)
}

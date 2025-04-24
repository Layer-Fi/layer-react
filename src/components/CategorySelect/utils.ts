import { BankTransaction, CategorizationType, Category } from '../../types'
import { CategoryWithEntries, SuggestedMatch } from '../../types/bank_transactions'
import { CategoryOption, CategoryWithHide, OptionActionType } from './types'

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
      subCategories: category.subCategories,
    },
  }
}

export const mapCategoryToExclusionOption = (
  category: CategoryWithEntries & { type: 'ExclusionNested' },
): CategoryOption => {
  return {
    type: OptionActionType.CATEGORY,
    payload: {
      id: category.id,
      option_type: OptionActionType.CATEGORY,
      display_name: category.display_name,
      type: 'ExclusionNested',
      stable_name: '',
      entries: category.entries,
      subCategories: category.subCategories,
    },
  }
}

export const mapSuggestedMatchToOption = (
  record: SuggestedMatch,
): CategoryOption => {
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

export function buildMatchOptions(bankTransaction: BankTransaction, excludeMatches?: boolean, searchPhrase?: string) {
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
  }).filter(x => x.payload.display_name.toLowerCase().includes(searchPhrase?.toLowerCase() ?? ''))
}

export function buildSuggestedOptions(bankTransaction: BankTransaction, searchPhrase?: string) {
  if (bankTransaction?.categorization_flow?.type === CategorizationType.ASK_FROM_SUGGESTIONS) {
    return bankTransaction.categorization_flow.suggestions.map(x => mapCategoryToOption(x)).filter(x => x.payload.display_name.toLowerCase().includes(searchPhrase?.toLowerCase() ?? ''))
  }

  return
}

export const filterCategories = (cats: Category[], searchPhrase: string): Category[] => {
  return cats
    .map((cat) => {
      // Check if current category matches
      const matchesSearch = cat.display_name.toLowerCase().includes(searchPhrase)

      // Filter subcategories if they exist
      const filteredSubcategories = cat.subCategories
        ? filterCategories(cat.subCategories, searchPhrase)
        : undefined

      // Determine if all subcategories are hidden
      const allSubcategoriesHidden = filteredSubcategories
        ? filteredSubcategories.every(subCat => (subCat as CategoryWithHide).hide)
        : false

      // If current category matches or has matching subcategories, include it
      if (matchesSearch || (filteredSubcategories && filteredSubcategories.length > 0 && !allSubcategoriesHidden)) {
        return {
          ...cat,
          subCategories: filteredSubcategories,
        }
      }

      return {
        ...cat,
        subCategories: filteredSubcategories,
        hide: true,
      }
    }) as Category[] // @TODO this is wrong
}

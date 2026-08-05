import { isPlaceholderAsOption, isSplitAsOption } from '@internal-types/bankTransactionCategoryComboBoxOption'
import type { BankTransactionNonSuggestedMatchOption } from '@internal-types/bankTransactionMatchOption'
import { type BankTransaction } from '@internal-types/bankTransactions'
import { ApiCategorizationAsOption, PlaceholderAsOption } from '@internal-types/categorizationOption'
import { InputStrategy } from '@schemas/features/bankTransactions/bankTransaction'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@utils/features/bankTransactions/categorizationOption'
import { type BankTransactionsMobileCategorySelectionItemOption } from '@features/bankTransactions/BankTransactionsMobileCategorySelection/BankTransactionsMobileCategorySelectionItem'

const SELECT_CATEGORY_VALUE = 'SELECT_CATEGORY'

const isSingleSelectedCategory = (selectedCategory: BankTransactionNonSuggestedMatchOption | null): boolean => {
  if (!selectedCategory) return false
  if (isPlaceholderAsOption(selectedCategory)) return false
  if (isSplitAsOption(selectedCategory) && !selectedCategory.isSingleSplit) return false
  return true
}

const getSuggestedCategoryOptions = (bankTransaction: BankTransaction) => {
  if (bankTransaction.categorizationFlow?.type !== InputStrategy.AskFromSuggestions) return []
  return bankTransaction.categorizationFlow.suggestions.map(suggestion => new ApiCategorizationAsOption(suggestion))
}

export const getSuggestedCategoryValues = (bankTransaction: BankTransaction) =>
  new Set(getSuggestedCategoryOptions(bankTransaction).map(option => option.value))

export const buildInitialSessionCategoriesMap = (
  bankTransaction: BankTransaction,
  selectedCategory: BankTransactionNonSuggestedMatchOption | null,
) => {
  const categoriesMap = new Map<string, BankTransactionNonSuggestedMatchOption>()

  if (bankTransaction.category) {
    const existingCategory = convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
    if (isSingleSelectedCategory(existingCategory)) {
      categoriesMap.set(existingCategory.value, existingCategory)
    }
  }

  getSuggestedCategoryOptions(bankTransaction).forEach((suggestionOption) => {
    categoriesMap.set(suggestionOption.value, suggestionOption)
  })

  if (selectedCategory && isSingleSelectedCategory(selectedCategory)) {
    categoriesMap.set(selectedCategory.value, selectedCategory)
  }

  return categoriesMap
}

export const buildCategoryOptions = (
  sessionCategories: Map<string, BankTransactionNonSuggestedMatchOption>,
  showAllCategoriesLabel: string,
  suggestedCategoryValues: ReadonlySet<string>,
): BankTransactionsMobileCategorySelectionItemOption[] => {
  const categoryOptionsList: BankTransactionsMobileCategorySelectionItemOption[] = Array.from(sessionCategories.values()).map(category => ({
    value: category,
    isSuggested: suggestedCategoryValues.has(category.value),
  }))

  categoryOptionsList.push({
    value: new PlaceholderAsOption({
      label: showAllCategoriesLabel,
      value: SELECT_CATEGORY_VALUE,
    }),
    asLink: true,
  })

  return categoryOptionsList
}

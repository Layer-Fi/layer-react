import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption, PlaceholderAsOption } from '@internal-types/categorizationOption'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { isPlaceholderAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { type BankTransactionsMobileCategorySelectionItemOption } from '@components/BankTransactionsMobileCategorySelection/BankTransactionsMobileCategorySelectionItem'

const SELECT_CATEGORY_VALUE = 'SELECT_CATEGORY'

export const buildInitialSessionCategoriesMap = (
  bankTransaction: BankTransaction,
  selectedCategory: BankTransactionNonSuggestedMatchOption | null,
) => {
  const categoriesMap = new Map<string, BankTransactionNonSuggestedMatchOption>()

  if (bankTransaction.category) {
    const existingCategory = convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
    categoriesMap.set(existingCategory.value, existingCategory)
  }

  if (bankTransaction?.categorization_flow?.type === CategorizationType.ASK_FROM_SUGGESTIONS) {
    bankTransaction.categorization_flow.suggestions.forEach((suggestion) => {
      const suggestionOption = new ApiCategorizationAsOption(suggestion)
      categoriesMap.set(suggestionOption.value, suggestionOption)
    })
  }

  if (!selectedCategory) return categoriesMap
  if (isPlaceholderAsOption(selectedCategory)) return categoriesMap
  if (isSplitAsOption(selectedCategory) && !selectedCategory.isSingleSplit) return categoriesMap

  categoriesMap.set(selectedCategory.value, selectedCategory)

  return categoriesMap
}

export const buildCategoryOptions = (
  sessionCategories: Map<string, BankTransactionNonSuggestedMatchOption>,
  showAllCategoriesLabel: string,
): BankTransactionsMobileCategorySelectionItemOption[] => {
  const categoryOptionsList: BankTransactionsMobileCategorySelectionItemOption[] = Array.from(sessionCategories.values()).map(category => ({
    value: category,
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

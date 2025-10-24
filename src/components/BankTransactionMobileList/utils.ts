import { BankTransaction } from '../../types/bank_transactions'
import { hasSuggestions } from '../../types/categories'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { CategoryAsOption, ApiCategorizationAsOption, type BankTransactionCategoryComboBoxOption } from '../BankTransactionCategoryComboBox/options'
import type { NestedCategorization } from '../../schemas/categorization'

export interface CategoryGroup {
  label: string
  id: string
  categories: CategoryAsOption[]
}

function getLeafCategories(category: NestedCategorization): NestedCategorization[] {
  if (!category.subCategories || category.subCategories.length === 0) {
    return [category]
  }

  return category.subCategories.flatMap(subCategory => getLeafCategories(subCategory))
}

export const flattenCategories = (categories: NestedCategorization[]): Array<CategoryGroup | CategoryAsOption> => {
  return categories.flatMap((category: NestedCategorization): Array<CategoryGroup | CategoryAsOption> => {
    const subCategories = category.subCategories

    if (!subCategories || subCategories.length === 0) {
      return [new CategoryAsOption(category)]
    }

    const leafCategories = getLeafCategories(category)

    if (subCategories.every(subCategory => !subCategory.subCategories || subCategory.subCategories.length === 0)) {
      return [{
        label: category.displayName,
        id: 'id' in category ? category.id : category.stableName,
        categories: leafCategories.map(cat => new CategoryAsOption(cat)),
      } satisfies CategoryGroup]
    }

    return leafCategories.map(cat => new CategoryAsOption(cat))
  })
}

export const getAssignedValue = (
  bankTransaction: BankTransaction,
): BankTransactionCategoryComboBoxOption | null => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    || bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return null
  }

  if (
    bankTransaction.category
    && bankTransaction.category.type != 'Exclusion'
  ) {
    return new ApiCategorizationAsOption(bankTransaction.category)
  }

  if (hasSuggestions(bankTransaction.categorization_flow)) {
    const firstSuggestion = (
      bankTransaction.categorization_flow
    ).suggestions[0]
    return new ApiCategorizationAsOption(firstSuggestion)
  }

  return null
}

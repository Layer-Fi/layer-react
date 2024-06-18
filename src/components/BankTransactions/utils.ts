import { BankTransaction, CategorizationScope } from '../../types'
import { CategorizedCategories, ReviewCategories } from './constants'

export const filterVisibility = (
  scope: CategorizationScope,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorization_status,
  )
  const inReview = ReviewCategories.includes(
    bankTransaction.categorization_status,
  )

  return (
    (scope === CategorizationScope.TO_REVIEW && inReview) ||
    (scope === CategorizationScope.CATEGORIZED && categorized)
  )
}

export const isCategorized = (bankTransaction: BankTransaction) =>
  CategorizedCategories.includes(bankTransaction.categorization_status)

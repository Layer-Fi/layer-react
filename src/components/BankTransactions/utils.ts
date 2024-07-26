import { BankTransaction, DisplayState } from '../../types'
import { CategorizedCategories, ReviewCategories } from './constants'

export const filterVisibility = (
  scope: DisplayState,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorization_status,
  )
  const inReview = ReviewCategories.includes(
    bankTransaction.categorization_status,
  )

  return (
    (scope === DisplayState.review && inReview) ||
    (scope === DisplayState.categorized && categorized)
  )
}

export const isCategorized = (bankTransaction: BankTransaction) =>
  CategorizedCategories.includes(bankTransaction.categorization_status)

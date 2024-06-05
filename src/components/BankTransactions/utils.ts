import { BankTransaction } from '../../types'
import {
  CategorizedCategories,
  DisplayState,
  ReviewCategories,
} from './constants'

export const filterVisibility = (
  display: DisplayState,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorization_status,
  )
  const inReview =
    ReviewCategories.includes(bankTransaction.categorization_status) &&
    !bankTransaction.recently_categorized

  return (
    (display === DisplayState.review && inReview) ||
    (display === DisplayState.categorized && categorized)
  )
}

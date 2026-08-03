import { type ApiCategorizationAsOption, CategorizationOption, type CategoryAsOption, type PlaceholderAsOption, type SplitAsOption, type SuggestedMatchAsOption } from '@internal-types/categorizationOption'

export type BankTransactionCategoryComboBoxOption =
  CategoryAsOption |
  SuggestedMatchAsOption |
  SplitAsOption |
  PlaceholderAsOption |
  ApiCategorizationAsOption

export const isCategoryAsOption = (option: BankTransactionCategoryComboBoxOption): option is CategoryAsOption => {
  return option.type === CategorizationOption.Category
}

export const isSuggestedMatchAsOption = (option: BankTransactionCategoryComboBoxOption): option is SuggestedMatchAsOption => {
  return option.type === CategorizationOption.SuggestedMatch
}

export const isSplitAsOption = (option: BankTransactionCategoryComboBoxOption): option is SplitAsOption => {
  return option.type === CategorizationOption.Split
}

export const isApiCategorizationAsOption = (option: BankTransactionCategoryComboBoxOption): option is ApiCategorizationAsOption => {
  return option.type === CategorizationOption.ApiCategorization
}

export const isPlaceholderAsOption = (option: BankTransactionCategoryComboBoxOption): option is PlaceholderAsOption => {
  return option.type === CategorizationOption.Placeholder
}

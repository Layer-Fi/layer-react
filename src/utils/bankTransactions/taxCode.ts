import { type BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionTaxOption } from '@schemas/bankTransactions/bankTransaction'
import { isClassificationExclusion } from '@schemas/categorization'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export const getBankTransactionTaxOptions = (bankTransaction?: BankTransaction): BankTransactionTaxOption[] => {
  if (!bankTransaction?.tax_options) {
    return []
  }

  return Object.values(bankTransaction.tax_options).flat()
}

export const hasBankTransactionTaxCode = (
  bankTransaction: BankTransaction | undefined,
  selectedTaxCode: TaxCodeComboBoxOption | null,
) => {
  if (!selectedTaxCode) return false
  return getBankTransactionTaxOptions(bankTransaction).some(taxOption => taxOption.code === selectedTaxCode.value)
}

export const getCategoryPayloadTaxCode = (
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  selectedTaxCode: TaxCodeComboBoxOption | null,
) => {
  if (!canCategoryHaveTaxCode(selectedCategory)) return null

  return selectedTaxCode?.value ?? null
}

export const canCategoryHaveTaxCode = (
  category: BankTransactionCategoryComboBoxOption | null | undefined,
): boolean => {
  if (!category) return true

  if (isPlaceholderAsOption(category)) return false
  if (isSuggestedMatchAsOption(category)) return false
  if (isSplitAsOption(category)) return false

  if (!category.classification) return false
  if (isClassificationExclusion(category.classification)) return false

  return true
}

export const resolveCategoryTaxCode = (
  bankTransaction: BankTransaction | undefined,
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  selectedTaxCode: TaxCodeComboBoxOption | null,
): string | null => {
  const resolvedTaxCode = hasBankTransactionTaxCode(bankTransaction, selectedTaxCode) ? selectedTaxCode : null

  return getCategoryPayloadTaxCode(selectedCategory, resolvedTaxCode)
}

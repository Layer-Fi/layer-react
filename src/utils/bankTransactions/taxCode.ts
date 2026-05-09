import { type BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionTaxOption } from '@schemas/bankTransactions/bankTransaction'
import { isClassificationExclusion } from '@schemas/categorization'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const getBankTransactionTaxOptions = (bankTransaction?: BankTransaction): BankTransactionTaxOption[] => {
  if (!bankTransaction?.tax_options) {
    return []
  }

  return Object.values(bankTransaction.tax_options).flat()
}

export const getDefaultTaxCodeForBankTransaction = (bankTransaction?: BankTransaction): string | null => {
  const taxCode = bankTransaction?.tax_code
  if (!taxCode) return null

  const isKnown = getBankTransactionTaxOptions(bankTransaction).some(option => option.code === taxCode)

  return isKnown ? taxCode : null
}

export const hasBankTransactionTaxCode = (
  bankTransaction: BankTransaction | undefined,
  selectedTaxCode: string | null,
) => {
  if (!selectedTaxCode) return false
  return getBankTransactionTaxOptions(bankTransaction).some(taxOption => taxOption.code === selectedTaxCode)
}

export const getCategoryPayloadTaxCode = (
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  selectedTaxCode: string | null,
) => {
  if (!canCategoryHaveTaxCode(selectedCategory)) return null

  return selectedTaxCode ?? null
}

export const canCategoryHaveTaxCode = (
  category: BankTransactionCategoryComboBoxOption | null | undefined,
): boolean => {
  if (!category) return true

  if (isPlaceholderAsOption(category)) return false
  if (isSuggestedMatchAsOption(category)) return false
  if (isSplitAsOption(category)) {
    if (category.original.length === 1) {
      const classification = category.original[0].category?.classification
      return !!classification && !isClassificationExclusion(classification)
    }

    return false
  }

  const classification = category.classification
  return !!classification && !isClassificationExclusion(classification)
}

export const resolveCategoryTaxCode = (
  bankTransaction: BankTransaction | undefined,
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  selectedTaxCode: string | null,
): string | null => {
  const resolvedTaxCode = hasBankTransactionTaxCode(bankTransaction, selectedTaxCode) ? selectedTaxCode : null

  return getCategoryPayloadTaxCode(selectedCategory, resolvedTaxCode)
}

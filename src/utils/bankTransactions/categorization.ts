import { type BankTransaction, type BankTransactionTaxOption } from '@internal-types/bankTransactions'
import type { Classification } from '@schemas/categorization'
import { type BankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import {
  type BankTransactionCategoryComboBoxOption,
  isSplitAsOption,
  isSuggestedMatchAsOption,
} from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export const applyCategoryChange = (
  prev: BankTransactionCategorization | undefined,
  newCategory: BankTransactionCategoryComboBoxOption | null,
): BankTransactionCategorization => {
  return {
    category: newCategory,
    taxCode: canCategoryHaveTaxCode(newCategory)
      ? prev?.taxCode ?? null
      : null,
  }
}

export const getBankTransactionTaxOptions = (bankTransaction?: BankTransaction): BankTransactionTaxOption[] => {
  if (!bankTransaction?.tax_options) {
    return []
  }

  return Object.values(bankTransaction.tax_options).flat()
}

export const getBankTransactionTaxCodeOptions = (bankTransaction?: BankTransaction): TaxCodeComboBoxOption[] => {
  return getBankTransactionTaxOptions(bankTransaction).map(taxOption => new TaxCodeComboBoxOption(taxOption))
}

export const getBankTransactionTaxCodeOption = (
  bankTransaction: BankTransaction | undefined,
  taxCode: string | null,
): TaxCodeComboBoxOption | null => {
  if (!taxCode) {
    return null
  }

  const taxOption = getBankTransactionTaxOptions(bankTransaction).find(option => option.code === taxCode)

  return taxOption ? new TaxCodeComboBoxOption(taxOption) : null
}

export const hasBankTransactionTaxCode = (
  bankTransaction: BankTransaction | undefined,
  taxCode: string | null,
) => {
  return getBankTransactionTaxOptions(bankTransaction).some(taxOption => taxOption.code === taxCode)
}

export const isExclusionClassification = (
  classification: Classification | null | undefined,
): boolean => {
  return classification?.type === 'Exclusion'
}

export const isExclusionCategory = (
  category: BankTransactionCategoryComboBoxOption | null | undefined,
): boolean => {
  return isExclusionClassification(category?.classification)
}

export const getCategoryPayloadTaxCode = (
  classification: Classification | null | undefined,
  taxCode: string | null | undefined,
) => {
  if (isExclusionClassification(classification)) {
    return null
  }

  return taxCode ?? null
}

export const canCategoryHaveTaxCode = (
  category: BankTransactionCategoryComboBoxOption | null | undefined,
): boolean => {
  if (!category) return true
  if (isExclusionCategory(category)) return false
  if (isSuggestedMatchAsOption(category)) return false
  if (isSplitAsOption(category)) return false
  return true
}

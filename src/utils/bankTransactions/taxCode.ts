import { type BankTransaction, type BankTransactionTaxOption } from '@internal-types/bankTransactions'
import type { Classification } from '@schemas/categorization'
import type { ComboBoxOption } from '@ui/ComboBox/types'

export const getBankTransactionTaxOptions = (bankTransaction?: BankTransaction): BankTransactionTaxOption[] => {
  if (!bankTransaction?.tax_options) {
    return []
  }

  return Object.values(bankTransaction.tax_options).flat()
}

export const getBankTransactionTaxCodeOptions = (bankTransaction?: BankTransaction): ComboBoxOption[] => {
  return getBankTransactionTaxOptions(bankTransaction).map(taxOption => ({
    label: taxOption.display_name,
    value: taxOption.code,
  }))
}

export const getBankTransactionTaxCodeOption = (
  bankTransaction: BankTransaction | undefined,
  taxCode: string | null,
): ComboBoxOption | null => {
  if (!taxCode) {
    return null
  }

  const taxOption = getBankTransactionTaxOptions(bankTransaction).find(option => option.code === taxCode)

  return {
    label: taxOption?.display_name ?? taxCode,
    value: taxCode,
  }
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
  category: { classification?: Classification | null } | null | undefined,
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

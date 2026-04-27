import { type BankTransaction, type BankTransactionTaxOption } from '@internal-types/bankTransactions'
import type { Classification } from '@schemas/categorization'

export type BankTransactionTaxCodeOption = {
  label: string
  value: string
}

export const getBankTransactionTaxOptions = (bankTransaction?: BankTransaction): BankTransactionTaxOption[] => {
  if (!bankTransaction?.tax_options) {
    return []
  }

  return Object.values(bankTransaction.tax_options).flat()
}

export const getBankTransactionTaxCodeOptions = (bankTransaction?: BankTransaction): BankTransactionTaxCodeOption[] => {
  return getBankTransactionTaxOptions(bankTransaction).map(taxOption => ({
    label: taxOption.display_name,
    value: taxOption.code,
  }))
}

export const getBankTransactionTaxCodeOption = (
  bankTransaction: BankTransaction | undefined,
  taxCode: string | null,
): BankTransactionTaxCodeOption | null => {
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

export const getCategoryPayloadTaxCode = (
  classification: Classification | null | undefined,
  taxCode: string | null | undefined,
) => {
  if (classification?.type === 'Exclusion') {
    return null
  }

  return taxCode ?? null
}

import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getBankTransactionTaxCodeOptions } from '@utils/bankTransactions/categorization'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export type UseTaxCodeOptionsReturn = {
  taxCodeOptions: TaxCodeComboBoxOption[]
  hasTaxCodeOptions: boolean
  getSelectedTaxCodeOption: (taxCode: string | null | undefined) => TaxCodeComboBoxOption | null
}

export const useTaxCodeOptions = (
  bankTransaction: BankTransaction | undefined,
): UseTaxCodeOptionsReturn => {
  const taxCodeOptions = useMemo<TaxCodeComboBoxOption[]>(
    () => getBankTransactionTaxCodeOptions(bankTransaction),
    [bankTransaction],
  )

  const getSelectedTaxCodeOption = useCallback(
    (taxCode: string | null | undefined): TaxCodeComboBoxOption | null => {
      if (!taxCode) return null
      return taxCodeOptions.find(option => option.value === taxCode) ?? null
    },
    [taxCodeOptions],
  )

  return {
    taxCodeOptions,
    hasTaxCodeOptions: taxCodeOptions.length > 0,
    getSelectedTaxCodeOption,
  }
}

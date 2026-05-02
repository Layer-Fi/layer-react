import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getBankTransactionTaxCodeOptions } from '@utils/bankTransactions/categorization'
import { type ComboBoxOption } from '@ui/ComboBox/types'

export type UseTaxCodeOptionsReturn = {
  taxCodeOptions: ComboBoxOption[]
  hasTaxCodeOptions: boolean
  getSelectedTaxCodeOption: (taxCode: string | null | undefined) => ComboBoxOption | null
}

export const useTaxCodeOptions = (
  bankTransaction: BankTransaction | undefined,
): UseTaxCodeOptionsReturn => {
  const taxCodeOptions = useMemo<ComboBoxOption[]>(
    () => getBankTransactionTaxCodeOptions(bankTransaction),
    [bankTransaction],
  )

  const getSelectedTaxCodeOption = useCallback(
    (taxCode: string | null | undefined): ComboBoxOption | null => {
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

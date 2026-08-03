import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { TaxCodeComboBoxOption } from '@internal-types/taxCodeComboBoxOption'
import { getBankTransactionTaxOptions } from '@utils/bankTransactions/taxCode'

type UseTaxCodeOptionsReturn = {
  taxCodeOptions: TaxCodeComboBoxOption[]
  hasTaxCodeOptions: boolean
  getSelectedTaxCodeOption: (taxCode?: string | null) => TaxCodeComboBoxOption | null
}

export const useTaxCodeOptions = (bankTransaction?: BankTransaction): UseTaxCodeOptionsReturn => {
  const taxCodeOptions = useMemo(
    () => getBankTransactionTaxOptions(bankTransaction).map(option => new TaxCodeComboBoxOption(option)),
    [bankTransaction],
  )

  const hasTaxCodeOptions = taxCodeOptions.length > 0

  const getSelectedTaxCodeOption = useCallback((taxCode?: string | null): TaxCodeComboBoxOption | null => {
    if (!taxCode) {
      return null
    }

    return taxCodeOptions.find(option => option.value === taxCode) ?? null
  }, [taxCodeOptions])

  return { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption }
}

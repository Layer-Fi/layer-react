import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'
import { type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'

const getDefaultSelectedTaxCodeForBankTransaction = (bankTransaction: BankTransaction): TaxCodeSelectOption | null => {
  if (!bankTransaction.tax_code) {
    return null
  }

  const taxOption = bankTransaction.tax_options?.canada.find(option => option.code === bankTransaction.tax_code)

  return {
    label: taxOption?.display_name ?? bankTransaction.tax_code,
    value: bankTransaction.tax_code,
  }
}

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategorizations } = useBankTransactionsCategorizationActions()

  useEffect(() => {
    if (!bankTransactions) return

    setOnlyNewTransactionCategorizations(new Map(
      bankTransactions.map(transaction => [
        transaction.id,
        {
          category: getDefaultSelectedCategoryForBankTransaction(transaction),
          taxCode: getDefaultSelectedTaxCodeForBankTransaction(transaction),
        },
      ]),
    ))
  }, [bankTransactions, setOnlyNewTransactionCategorizations])
}

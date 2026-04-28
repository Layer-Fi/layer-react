import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getBankTransactionTaxCodeOption, isExclusionCategory } from '@utils/bankTransactions/shared'
import { type BankTransactionCategorization, useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategorizations } = useBankTransactionsCategorizationActions()

  useEffect(() => {
    if (!bankTransactions) return

    setOnlyNewTransactionCategorizations(new Map<string, BankTransactionCategorization>(
      bankTransactions.map((transaction): [string, BankTransactionCategorization] => {
        const category = getDefaultSelectedCategoryForBankTransaction(transaction)

        return [
          transaction.id,
          {
            category,
            taxCode: isExclusionCategory(category)
              ? null
              : getBankTransactionTaxCodeOption(transaction, transaction.tax_code ?? null),
          },
        ]
      }),
    ))
  }, [bankTransactions, setOnlyNewTransactionCategorizations])
}

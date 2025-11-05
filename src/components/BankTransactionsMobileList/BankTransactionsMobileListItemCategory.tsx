import { BankTransaction } from '../../types/bank_transactions'
import { isCategorized } from '../BankTransactions/utils'
import { Span } from '../ui/Typography/Text'
import { useGetBankTransactionCategory } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useMemo } from 'react'
import { BankTransactionsUncategorizedSelectedValue } from '../BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'
import { BankTransactionsCategorizedSelectedValue } from '../BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'

export interface BankTransactionsMobileListItemCategoryProps {
  bankTransaction: BankTransaction
}

export const BankTransactionsMobileListItemCategory = ({
  bankTransaction,
}: BankTransactionsMobileListItemCategoryProps) => {
  const categorized = isCategorized(bankTransaction)
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const selectedValue = useMemo(() => {
    return <BankTransactionsUncategorizedSelectedValue selectedValue={selectedCategory ?? null} />
  }, [selectedCategory])

  if (categorized) {
    return (
      <BankTransactionsCategorizedSelectedValue bankTransaction={bankTransaction} />
    )
  }

  return (
    <Span size='sm'>
      {selectedValue ?? 'No category selected'}
    </Span>
  )
}

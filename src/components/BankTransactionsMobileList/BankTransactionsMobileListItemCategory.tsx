import { BankTransaction } from '@internal-types/bank_transactions'
import { isCategorized } from '@components/BankTransactions/utils'
import { Span } from '@ui/Typography/Text'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useMemo } from 'react'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'

export interface BankTransactionsMobileListItemCategoryProps {
  bankTransaction: BankTransaction
  className?: string
}

export const BankTransactionsMobileListItemCategory = ({
  bankTransaction,
  className,
}: BankTransactionsMobileListItemCategoryProps) => {
  const categorized = isCategorized(bankTransaction)
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const selectedValue = useMemo(() => {
    return <BankTransactionsUncategorizedSelectedValue selectedValue={selectedCategory ?? null} className={className} />
  }, [selectedCategory, className])

  if (categorized) {
    return (
      <BankTransactionsCategorizedSelectedValue bankTransaction={bankTransaction} className={className} />
    )
  }

  return (
    selectedCategory
      ? selectedValue
      : (
        <Span ellipsis className={className} size='sm'>
          No category selected
        </Span>
      )
  )
}

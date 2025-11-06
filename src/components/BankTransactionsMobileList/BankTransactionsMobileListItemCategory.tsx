import { BankTransaction } from '@internal-types/bank_transactions'
import { isCategorized } from '@components/BankTransactions/utils'
import { Span } from '@ui/Typography/Text'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { BankTransactionsSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsSelectedValue'

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

  if (categorized) {
    return (
      <BankTransactionsSelectedValue
        bankTransaction={bankTransaction}
        className={className}
        size='sm'
      />
    )
  }

  return (
    selectedCategory
      ? (
        <BankTransactionsSelectedValue
          selectedValue={selectedCategory ?? null}
          className={className}
          size='sm'
        />
      )
      : (
        <Span ellipsis className={className} size='sm'>
          No category selected
        </Span>
      )
  )
}

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { isCategorized } from '@components/BankTransactions/utils'
import { BankTransactionsBaseSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'

import './bankTransactionsListItemCategory.scss'

export interface BankTransactionsListItemCategoryProps {
  bankTransaction: BankTransaction
  mobile?: boolean
}

export const BankTransactionsListItemCategory = ({
  bankTransaction,
  mobile = false,
}: BankTransactionsListItemCategoryProps) => {
  const className = mobile
    ? 'Layer__bankTransactionsListItemCategory__Mobile'
    : 'Layer__bankTransactionsListItemCategory__List'
  const categorized = isCategorized(bankTransaction)
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

  if (categorized) {
    return (
      <BankTransactionsCategorizedSelectedValue
        bankTransaction={bankTransaction}
        className={className}
        slotProps={{ Label: { size: 'sm' } }}
        showCategoryBadge={mobile}
      />
    )
  }

  return (
    selectedCategory
      ? (
        <BankTransactionsUncategorizedSelectedValue
          selectedValue={selectedCategory ?? null}
          className={className}
          slotProps={{ Label: { size: 'sm' } }}
          showCategoryBadge={mobile}
        />
      )
      : (
        <BankTransactionsBaseSelectedValue
          type='placeholder'
          label='No category selected'
          className={className}
          slotProps={{ Label: { size: 'sm' } }}
          showCategoryBadge={mobile}
        />
      )
  )
}

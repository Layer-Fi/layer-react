import { BankTransaction } from '@internal-types/bank_transactions'
import { isCategorized } from '@components/BankTransactions/utils'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'
import './bankTransactionsMobileListItemCategory.scss'
import { BankTransactionsBaseSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'

export interface BankTransactionsMobileListItemCategoryProps {
  bankTransaction: BankTransaction
}

export const BankTransactionsMobileListItemCategory = ({
  bankTransaction,
}: BankTransactionsMobileListItemCategoryProps) => {
  const categorized = isCategorized(bankTransaction)
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

  if (categorized) {
    return (
      <BankTransactionsCategorizedSelectedValue
        bankTransaction={bankTransaction}
        className='Layer__bankTransactionsMobileListItemCategory'
        slotProps={{ Label: { size: 'sm' } }}
      />
    )
  }

  return (
    selectedCategory
      ? (
        <BankTransactionsUncategorizedSelectedValue
          selectedValue={selectedCategory ?? null}
          className='Layer__bankTransactionsMobileListItemCategory'
          slotProps={{ Label: { size: 'sm' } }}
        />
      )
      : (
        <BankTransactionsBaseSelectedValue
          type='placeholder'
          label='No category selected'
          className='Layer__bankTransactionsMobileListItemCategory'
          slotProps={{ Label: { size: 'sm' } }}
        />
      )
  )
}

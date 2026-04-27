import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useGetBankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { isCategorized } from '@utils/bankTransactions/shared'
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
  const { t } = useTranslation()
  const className = mobile
    ? 'Layer__bankTransactionsListItemCategory__Mobile'
    : 'Layer__bankTransactionsListItemCategory__List'
  const categorized = isCategorized(bankTransaction)
  const { selectedCategorization } = useGetBankTransactionCategorization(bankTransaction.id)
  const selectedCategory = selectedCategorization?.category

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
          label={t('bankTransactions:empty.no_category_selected', 'No category selected')}
          className={className}
          slotProps={{ Label: { size: 'sm' } }}
          showCategoryBadge={mobile}
        />
      )
  )
}

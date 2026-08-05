import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { BankTransactionsCategorizedSelectedValue } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { BankTransactionsSelectedValue } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsSelectedValue'
import { BankTransactionsUncategorizedSelectedValue } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'

import './bankTransactionsListItemCategory.scss'

export interface BankTransactionsListItemCategoryProps {
  bankTransaction: BankTransaction
  mobile?: boolean
  categorized?: boolean
}

export const BankTransactionsListItemCategory = ({
  bankTransaction,
  mobile = false,
  categorized,
}: BankTransactionsListItemCategoryProps) => {
  const { t } = useTranslation()
  const className = mobile
    ? 'Layer__bankTransactionsListItemCategory__Mobile'
    : 'Layer__bankTransactionsListItemCategory__List'
  const selectedOption = useGetBankTransactionMatchOrCategoryWithDefault(bankTransaction)

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

  return selectedOption
    ? (
      <BankTransactionsUncategorizedSelectedValue
        selectedValue={selectedOption}
        className={className}
        slotProps={{ Label: { size: 'sm' } }}
        showCategoryBadge={mobile}
      />
    )
    : (
      <BankTransactionsSelectedValue
        type='placeholder'
        label={t('bankTransactions:BankTransactionsListItemCategory.empty.no_category_selected', 'No category selected')}
        className={className}
        slotProps={{ Label: { size: 'sm' } }}
        showCategoryBadge={mobile}
      />
    )
}

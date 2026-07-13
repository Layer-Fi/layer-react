import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { BankTransactionsBaseSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'

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
      <BankTransactionsBaseSelectedValue
        type='placeholder'
        label={t('bankTransactions:empty.no_category_selected', 'No category selected')}
        className={className}
        slotProps={{ Label: { size: 'sm' } }}
        showCategoryBadge={mobile}
      />
    )
}

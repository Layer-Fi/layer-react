import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type CategorizationEncoded, isSplitCategorizationEncoded } from '@schemas/categorization'
import { isTransferMatch } from '@utils/bankTransactions'
import { BankTransactionsBaseSelectedValue, type BankTransactionsBaseSelectedValueProps } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'

type BankTransactionsCategorizedSelectedValueProps = {
  bankTransaction: BankTransaction
  className?: string
  showCategoryBadge?: boolean
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

const extractDescriptionForSplit = (category: CategorizationEncoded | null) => {
  if (!category || !isSplitCategorizationEncoded(category)) {
    return ''
  }

  return category.entries.map(c => c.category.display_name).join(', ')
}

const normalizeFromBankTransaction = (bankTransaction: BankTransaction): BankTransactionsBaseSelectedValueProps => {
  if (bankTransaction.categorization_status === CategorizationStatus.MATCHED && bankTransaction.match) {
    return {
      type: isTransferMatch(bankTransaction) ? 'transfer' : 'match',
      label: bankTransaction.match?.details?.description ?? '',
    }
  }

  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return {
      type: 'split',
      label: extractDescriptionForSplit(bankTransaction.category),
    }
  }

  return {
    type: 'category',
    label: bankTransaction.category?.display_name ?? '',
  }
}

export const BankTransactionsCategorizedSelectedValue = (props: BankTransactionsCategorizedSelectedValueProps) => {
  const { bankTransaction, className, slotProps, showCategoryBadge } = props

  const baseSelectedValue = normalizeFromBankTransaction(bankTransaction)
  return (
    <BankTransactionsBaseSelectedValue
      {...baseSelectedValue}
      slotProps={slotProps}
      className={className}
      showCategoryBadge={showCategoryBadge}
      isCategorized
    />
  )
}

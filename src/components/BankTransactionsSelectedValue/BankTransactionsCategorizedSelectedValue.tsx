import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type Categorization, isSplitCategorization } from '@schemas/categorization'
import { isTransferMatch } from '@utils/bankTransactions/shared'
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

const extractDescriptionForSplit = (category: Categorization | null | undefined) => {
  if (!category || !isSplitCategorization(category)) {
    return ''
  }

  return category.entries.map(c => c.category.displayName).join(', ')
}

const normalizeFromBankTransaction = (bankTransaction: BankTransaction): BankTransactionsBaseSelectedValueProps => {
  if (bankTransaction.categorizationStatus === CategorizationStatus.MATCHED && bankTransaction.match) {
    return {
      type: isTransferMatch(bankTransaction) ? 'transfer' : 'match',
      label: bankTransaction.match?.details?.description ?? '',
    }
  }

  if (bankTransaction.categorizationStatus === CategorizationStatus.SPLIT) {
    return {
      type: 'split',
      label: extractDescriptionForSplit(bankTransaction.category),
    }
  }

  return {
    type: 'category',
    label: bankTransaction.category?.displayName ?? '',
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

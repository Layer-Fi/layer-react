import { BankTransactionsBaseSelectedValue, type BankTransactionsBaseSelectedValueProps } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'
import { BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '@utils/bankTransactions'
import { extractDescriptionForSplit } from '@components/BankTransactionRow/BankTransactionRow'

type BankTransactionsCategorizedSelectedValueProps = {
  bankTransaction: BankTransaction
  size?: 'sm' | 'md'
  className?: string
}

export const BankTransactionsCategorizedSelectedValue = (props: BankTransactionsCategorizedSelectedValueProps) => {
  const { bankTransaction, size = 'md', className } = props

  const baseSelectedValue = normalizeFromBankTransaction(bankTransaction)
  return <BankTransactionsBaseSelectedValue {...baseSelectedValue} slotProps={{ Label: { size } }} className={className} />
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

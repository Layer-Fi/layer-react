import Scissors from '@icons/Scissors'
import MinimizeTwo from '@icons/MinimizeTwo'
import { BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '@utils/bankTransactions'
import { Badge, BadgeSize } from '@components/Badge/Badge'
import { Span } from '@ui/Typography/Text'
import { extractDescriptionForSplit } from '@components/BankTransactionRow/BankTransactionRow'
import { HStack } from '@ui/Stack/Stack'
import { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

type DisplayData = {
  type: 'match' | 'transfer' | 'split' | 'category'
  label: string
} | null

type BankTransactionsSelectedValueProps =
  | {
    bankTransaction: BankTransaction
    size?: 'sm' | 'md'
    className?: string
  }
  | {
    selectedValue: BankTransactionCategoryComboBoxOption | null
    size?: 'sm' | 'md'
    className?: string
  }

const normalizeFromBankTransaction = (bankTransaction: BankTransaction): DisplayData => {
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

const normalizeFromSelectedValue = (selectedValue: BankTransactionCategoryComboBoxOption | null): DisplayData => {
  if (!selectedValue) return null

  if (isSuggestedMatchAsOption(selectedValue)) {
    return {
      type: selectedValue.original.details.type === 'Transfer_Match' ? 'transfer' : 'match',
      label: selectedValue.label,
    }
  }

  if (isSplitAsOption(selectedValue) && selectedValue.original.length > 1) {
    return {
      type: 'split',
      label: selectedValue.label,
    }
  }

  return {
    type: 'category',
    label: selectedValue.label,
  }
}

export const BankTransactionsSelectedValue = (props: BankTransactionsSelectedValueProps) => {
  const { className, size = 'md' } = props

  const badgeSize = size === 'sm' ? BadgeSize.SMALL : BadgeSize.MEDIUM

  const displayData = 'bankTransaction' in props
    ? normalizeFromBankTransaction(props.bankTransaction)
    : normalizeFromSelectedValue('selectedValue' in props ? props.selectedValue : null)

  if (!displayData) return null

  if (displayData.type === 'match' || displayData.type === 'transfer') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={badgeSize} icon={<MinimizeTwo size={11} />}>
          {displayData.type === 'transfer' ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis size={size}>{displayData.label}</Span>
      </HStack>
    )
  }

  if (displayData.type === 'split') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={badgeSize} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis size={size}>{displayData.label}</Span>
      </HStack>
    )
  }

  return <Span ellipsis size={size} className={className}>{displayData.label}</Span>
}

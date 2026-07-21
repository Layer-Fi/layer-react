import type { SplitAsOption } from '@internal-types/categorizationOption'
import { useSplitLabel } from '@hooks/features/bankTransactions/useSplitLabel'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionsBaseSelectedValue, type BankTransactionsBaseSelectedValueProps } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'

type BankTransactionsUncategorizedSelectedValueProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
  className?: string
  showCategoryBadge?: boolean
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

export const BankTransactionsUncategorizedSelectedValue = (props: BankTransactionsUncategorizedSelectedValueProps) => {
  const getSplitLabel = useSplitLabel()
  const { selectedValue, className, slotProps, showCategoryBadge } = props

  if (!selectedValue) return null

  const baseSelectedValue = normalizeFromSelectedValue(selectedValue, getSplitLabel)
  return (
    <BankTransactionsBaseSelectedValue
      {...baseSelectedValue}
      slotProps={slotProps}
      className={className}
      showCategoryBadge={showCategoryBadge}
    />
  )
}

const normalizeFromSelectedValue = (
  selectedValue: BankTransactionCategoryComboBoxOption,
  getSplitLabel: (split: SplitAsOption) => string,
): BankTransactionsBaseSelectedValueProps => {
  if (isSuggestedMatchAsOption(selectedValue)) {
    return {
      type: selectedValue.original.details.type === 'Transfer_Match' ? 'transfer' : 'match',
      label: selectedValue.label,
    }
  }

  if (isSplitAsOption(selectedValue) && selectedValue.original.length > 1) {
    return {
      type: 'split',
      label: getSplitLabel(selectedValue),
    }
  }

  return {
    type: 'category',
    label: selectedValue.label,
  }
}

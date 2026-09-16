import { type BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { isSplitAsOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { BankTransactionsSelectedValue, type BankTransactionsSelectedValueProps } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsSelectedValue'

type BankTransactionsUncategorizedSelectedValueProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
  className?: string
  showCategoryBadge?: boolean
  showAiSparkle?: boolean
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

export const BankTransactionsUncategorizedSelectedValue = (props: BankTransactionsUncategorizedSelectedValueProps) => {
  const { selectedValue, className, slotProps, showCategoryBadge, showAiSparkle } = props

  if (!selectedValue) return null

  const baseSelectedValue = normalizeFromSelectedValue(selectedValue)
  return (
    <BankTransactionsSelectedValue
      {...baseSelectedValue}
      slotProps={slotProps}
      showAiSparkle={showAiSparkle}
      className={className}
      showCategoryBadge={showCategoryBadge}
    />
  )
}

const normalizeFromSelectedValue = (selectedValue: BankTransactionCategoryComboBoxOption): BankTransactionsSelectedValueProps => {
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

import { BankTransactionsBaseSelectedValue, BankTransactionsBaseSelectedValueProps } from '@components/BankTransactionsSelectedValue/BankTransactionsBaseSelectedValue'
import { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

type BankTransactionsUncategorizedSelectedValueProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
  className?: string
  showBadge?: boolean
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

export const BankTransactionsUncategorizedSelectedValue = (props: BankTransactionsUncategorizedSelectedValueProps) => {
  const { selectedValue, className, slotProps, showBadge = true } = props

  if (!selectedValue) return null

  const baseSelectedValue = normalizeFromSelectedValue(selectedValue)
  return <BankTransactionsBaseSelectedValue {...baseSelectedValue} slotProps={slotProps} className={className} showBadge={showBadge} />
}

const normalizeFromSelectedValue = (selectedValue: BankTransactionCategoryComboBoxOption): BankTransactionsBaseSelectedValueProps => {
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

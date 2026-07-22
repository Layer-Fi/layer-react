import { useCallback, useId, useState } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { Label } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { convertCategoryOptionToCategoryUpdate } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'

import './recordTransactionFormCategoryCombobox.scss'

type RecordTransactionFormCategoryComboboxProps = {
  label: string
  placeholder: string
  value: CategoryUpdate | null
  onValueChange: (value: CategoryUpdate | null) => void
  isInvalid?: boolean
  transaction?: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

export function RecordTransactionFormCategoryCombobox({
  label,
  placeholder,
  value,
  onValueChange,
  isInvalid,
  transaction,
  category,
}: RecordTransactionFormCategoryComboboxProps) {
  if (!transaction) {
    return (
      <LedgerAccountCombobox
        label={label}
        placeholder={placeholder}
        showLabel
        inline
        grouped
        isInvalid={isInvalid}
        value={value !== null && value.type === 'Category' ? value.category : null}
        onValueChange={classification => onValueChange(classification ? { type: 'Category', category: classification } : null)}
      />
    )
  }

  return (
    <RecordTransactionFormEditCategoryCombobox
      label={label}
      onValueChange={onValueChange}
      transaction={transaction}
      category={category}
    />
  )
}

type RecordTransactionFormEditCategoryComboboxProps = {
  label: string
  onValueChange: (value: CategoryUpdate | null) => void
  transaction: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

function RecordTransactionFormEditCategoryCombobox({ label, onValueChange, transaction, category }: RecordTransactionFormEditCategoryComboboxProps) {
  const inputId = useId()
  const [selectedValue, setSelectedValue] = useState<BankTransactionNonSuggestedMatchOption | null>(category ?? null)

  const onSelectedValueChange = useCallback((option: BankTransactionNonSuggestedMatchOption | null) => {
    setSelectedValue(option)
    onValueChange(convertCategoryOptionToCategoryUpdate(option))
  }, [onValueChange])

  return (
    <div className='Layer__RecordTransactionFormCategoryCombobox--inline'>
      <Label size='sm' htmlFor={inputId}>{label}</Label>
      <BankTransactionCategoryComboBox
        inputId={inputId}
        bankTransaction={transaction}
        includeSuggestedMatches={false}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelectedValueChange}
      />
    </div>
  )
}

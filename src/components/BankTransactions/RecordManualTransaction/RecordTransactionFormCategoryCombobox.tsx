import { useCallback, useId, useState } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { type Classification } from '@schemas/categorization'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { Label } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'

import './recordTransactionFormCategoryCombobox.scss'

type RecordTransactionFormCategoryComboboxProps = {
  label: string
  placeholder: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
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
        value={value}
        onValueChange={onValueChange}
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
  onValueChange: (value: Classification | null) => void
  transaction: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

function RecordTransactionFormEditCategoryCombobox({ label, onValueChange, transaction, category }: RecordTransactionFormEditCategoryComboboxProps) {
  const inputId = useId()
  const [selectedValue, setSelectedValue] = useState<BankTransactionNonSuggestedMatchOption | null>(category ?? null)

  const onSelectedValueChange = useCallback((option: BankTransactionNonSuggestedMatchOption | null) => {
    setSelectedValue(option)
    onValueChange(option?.classification ?? null)
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

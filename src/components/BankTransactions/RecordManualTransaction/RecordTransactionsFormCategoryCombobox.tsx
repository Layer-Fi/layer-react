import { useCallback, useId, useState } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { type Classification } from '@schemas/categorization'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { Label } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'

import './recordTransactionsFormCategoryCombobox.scss'

type RecordTransactionsFormCategoryComboboxProps = {
  label: string
  placeholder: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  isInvalid?: boolean
  transaction?: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

export function RecordTransactionsFormCategoryCombobox({
  label,
  placeholder,
  value,
  onValueChange,
  isInvalid,
  transaction,
  category,
}: RecordTransactionsFormCategoryComboboxProps) {
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
    <EditCategoryCombobox
      label={label}
      onValueChange={onValueChange}
      transaction={transaction}
      category={category}
    />
  )
}

type EditCategoryComboboxProps = {
  label: string
  onValueChange: (value: Classification | null) => void
  transaction: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

function EditCategoryCombobox({ label, onValueChange, transaction, category }: EditCategoryComboboxProps) {
  const inputId = useId()
  const [selectedValue, setSelectedValue] = useState<BankTransactionNonSuggestedMatchOption | null>(category ?? null)

  const onSelectedValueChange = useCallback((option: BankTransactionNonSuggestedMatchOption | null) => {
    setSelectedValue(option)
    onValueChange(option?.classification ?? null)
  }, [onValueChange])

  return (
    <div className='Layer__RecordTransactionsFormCategoryCombobox--inline'>
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

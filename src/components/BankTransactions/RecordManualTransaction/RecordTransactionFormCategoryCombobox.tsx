import { useCallback, useId, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type Classification, ClassificationEquivalence } from '@schemas/categorization'
import { getLeafCategories } from '@utils/categories'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
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
      value={value}
      onValueChange={onValueChange}
      transaction={transaction}
      category={category}
    />
  )
}

type RecordTransactionFormEditCategoryComboboxProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  transaction: BankTransaction
  category?: BankTransactionNonSuggestedMatchOption | null
}

function RecordTransactionFormEditCategoryCombobox({ label, value, onValueChange, transaction, category }: RecordTransactionFormEditCategoryComboboxProps) {
  const inputId = useId()
  const { data: categories } = useCategories()

  const options = useMemo(
    () => (categories ? getLeafCategories(categories).map(leaf => new CategoryAsOption(leaf)) : []),
    [categories],
  )

  // Derive the display from the form value (the source of truth) so it survives remounts, e.g. when
  // the delete step unmounts the form. Fall back to the seeded category (an existing split, which
  // has no single classification to reverse-map) only while nothing has been selected.
  const selectedValue = useMemo<BankTransactionNonSuggestedMatchOption | null>(() => {
    if (value === null) return category ?? null
    return options.find(option => ClassificationEquivalence(value, option.classification)) ?? null
  }, [value, category, options])

  const onSelectedValueChange = useCallback(
    (option: BankTransactionNonSuggestedMatchOption | null) => onValueChange(option?.classification ?? null),
    [onValueChange],
  )

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

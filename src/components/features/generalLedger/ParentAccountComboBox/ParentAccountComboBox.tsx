import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'
import { useParentAccountOptions } from '@features/generalLedger/ParentAccountComboBox/useParentAccountOptions'

type ParentAccountComboBoxProps = {
  label: string
  data?: LedgerBalancesSchemaType
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  inline?: boolean
}

export const ParentAccountComboBox = ({ label, data, value, onChange, error, inline }: ParentAccountComboBoxProps) => {
  const { t } = useTranslation()
  const parentOptions = useParentAccountOptions(data)
  const options = useMemo<ComboBoxOption[]>(
    () => parentOptions.map(option => ({ value: String(option.value), label: option.label })),
    [parentOptions],
  )

  return (
    <ComboBoxField label={label} inline={inline}>
      {controlProps => (
        <ComboBox
          {...controlProps}
          options={options}
          selectedValue={options.find(option => option.value === value) ?? null}
          onSelectedValueChange={option => onChange(option?.value ?? null)}
          placeholder={t('chartOfAccounts:placeholder.select_parent', 'Select a parent account')}
          isError={Boolean(error)}
          slots={{ ErrorMessage: error }}
        />
      )}
    </ComboBoxField>
  )
}

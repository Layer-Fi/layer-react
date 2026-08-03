import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'
import { LEDGER_ACCOUNT_TYPES_CONFIG } from '@features/generalLedger/constants'

type AccountTypeComboBoxProps = {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  isDisabled?: boolean
  error?: string
  inline?: boolean
}

export const AccountTypeComboBox = ({ label, value, onChange, isDisabled, error, inline }: AccountTypeComboBoxProps) => {
  const { t } = useTranslation()
  const options = useMemo<ComboBoxOption[]>(
    () => LEDGER_ACCOUNT_TYPES_CONFIG.map(config => ({ value: config.value, label: t(config.i18nKey, config.defaultValue) })),
    [t],
  )

  return (
    <ComboBoxField label={label} inline={inline}>
      {controlProps => (
        <ComboBox
          {...controlProps}
          options={options}
          selectedValue={options.find(option => option.value === value) ?? null}
          onSelectedValueChange={option => onChange(option?.value ?? null)}
          placeholder={t('chartOfAccounts:placeholder.select_type', 'Select a type')}
          isDisabled={isDisabled}
          isError={Boolean(error)}
          slots={{ ErrorMessage: error }}
        />
      )}
    </ComboBoxField>
  )
}

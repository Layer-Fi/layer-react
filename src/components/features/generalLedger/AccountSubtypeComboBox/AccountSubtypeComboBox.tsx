import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { SUBTYPES_CONFIG_BY_TYPE } from '@utils/features/generalLedger/constants'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

type AccountSubtypeComboBoxProps = {
  label: string
  type: LedgerAccountType | null
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  inline?: boolean
}

export const AccountSubtypeComboBox = ({ label, type, value, onChange, error, inline }: AccountSubtypeComboBoxProps) => {
  const { t } = useTranslation()
  const options = useMemo<ComboBoxOption[]>(() => {
    const configs = type
      ? SUBTYPES_CONFIG_BY_TYPE[type]
      : Object.values(SUBTYPES_CONFIG_BY_TYPE).flat()

    return configs.map(config => ({ value: config.value, label: t(config.i18nKey, config.defaultValue) }))
  }, [t, type])

  return (
    <ComboBoxField label={label} inline={inline}>
      {controlProps => (
        <ComboBox
          {...controlProps}
          options={options}
          selectedValue={options.find(option => option.value === value) ?? null}
          onSelectedValueChange={option => onChange(option?.value ?? null)}
          placeholder={t('chartOfAccounts:placeholder.select_sub_type', 'Select a sub-type')}
          isError={Boolean(error)}
          slots={{ ErrorMessage: error }}
        />
      )}
    </ComboBoxField>
  )
}

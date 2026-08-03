import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { formFieldLayoutProps } from '@blocks/forms/FormFieldShell'
import { NORMALITY_CONFIG } from '@features/generalLedger/constants'

type AccountNormalityComboBoxProps = {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  inline?: boolean
}

export const AccountNormalityComboBox = ({ label, value, onChange, error, inline }: AccountNormalityComboBoxProps) => {
  const { t } = useTranslation()
  const options = useMemo<ComboBoxOption[]>(
    () => NORMALITY_CONFIG.map(config => ({ value: config.value, label: t(config.i18nKey, config.defaultValue) })),
    [t],
  )

  return (
    <HStack {...formFieldLayoutProps({ inline })}>
      <Label slot='label' size='sm' htmlFor='normality'>{label}</Label>
      <ComboBox
        slot='input'
        inputId='normality'
        options={options}
        selectedValue={options.find(option => option.value === value) ?? null}
        onSelectedValueChange={option => onChange(option?.value ?? null)}
        placeholder={t('chartOfAccounts:placeholder.select_normality', 'Select a normality')}
        isError={Boolean(error)}
        slots={{ ErrorMessage: error }}
      />
    </HStack>
  )
}

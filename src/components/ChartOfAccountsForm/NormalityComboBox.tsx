import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { NORMALITY_CONFIG } from '@components/ChartOfAccountsForm/constants'

type NormalityComboBoxProps = {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  inline?: boolean
}

export const NormalityComboBox = ({ label, value, onChange, error, inline }: NormalityComboBoxProps) => {
  const { t } = useTranslation()
  const options = useMemo<ComboBoxOption[]>(
    () => NORMALITY_CONFIG.map(config => ({ value: config.value, label: t(config.i18nKey, config.defaultValue) })),
    [t],
  )

  return (
    <HStack className={classNames('Layer__ChartOfAccountsForm__ComboBoxField', inline && 'Layer__ChartOfAccountsForm__ComboBoxField--inline')}>
      <Label size='sm' htmlFor='normality'>{label}</Label>
      <ComboBox
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

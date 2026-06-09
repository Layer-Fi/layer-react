import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { LEDGER_ACCOUNT_TYPES_CONFIG } from '@components/ChartOfAccountsForm/constants'

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
    <HStack className={classNames('Layer__ChartOfAccountsForm__ComboBoxField', inline && 'Layer__ChartOfAccountsForm__ComboBoxField--inline')}>
      <Label size='sm' htmlFor='type'>{label}</Label>
      <ComboBox
        inputId='type'
        options={options}
        selectedValue={options.find(option => option.value === value) ?? null}
        onSelectedValueChange={option => onChange(option?.value ?? null)}
        placeholder={t('chartOfAccounts:placeholder.select_type', 'Select a type')}
        isDisabled={isDisabled}
        isError={Boolean(error)}
        slots={{ ErrorMessage: error }}
      />
    </HStack>
  )
}

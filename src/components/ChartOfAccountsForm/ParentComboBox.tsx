import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { useParentOptions } from '@components/ChartOfAccountsForm/useParentOptions'

type ParentComboBoxProps = {
  label: string
  data?: LedgerBalancesSchemaType
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  inline?: boolean
}

export const ParentComboBox = ({ label, data, value, onChange, error, inline }: ParentComboBoxProps) => {
  const { t } = useTranslation()
  const parentOptions = useParentOptions(data)
  const options = useMemo<ComboBoxOption[]>(
    () => parentOptions.map(option => ({ value: String(option.value), label: option.label })),
    [parentOptions],
  )

  return (
    <HStack className={classNames('Layer__ChartOfAccountsForm__ComboBoxField', inline && 'Layer__ChartOfAccountsForm__ComboBoxField--inline')}>
      <Label size='sm' htmlFor='parent'>{label}</Label>
      <ComboBox
        inputId='parent'
        options={options}
        selectedValue={options.find(option => option.value === value) ?? null}
        onSelectedValueChange={option => onChange(option?.value ?? null)}
        placeholder={t('chartOfAccounts:placeholder.select_parent', 'Select a parent account')}
        isError={Boolean(error)}
        slots={{ ErrorMessage: error }}
      />
    </HStack>
  )
}

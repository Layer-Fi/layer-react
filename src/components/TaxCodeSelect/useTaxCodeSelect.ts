import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { NO_TAX_CODE, TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

type UseTaxCodeSelectParams = {
  options: TaxCodeComboBoxOption[]
  value: TaxCodeComboBoxOption | null
  onChange: (value: TaxCodeComboBoxOption | null) => void
}

type UseTaxCodeSelectReturn = {
  allOptions: TaxCodeComboBoxOption[]
  selectedValue: TaxCodeComboBoxOption
  handleChange: (next: TaxCodeComboBoxOption | null) => void
  placeholder: string
}

export const useTaxCodeSelect = ({
  options,
  value,
  onChange,
}: UseTaxCodeSelectParams): UseTaxCodeSelectReturn => {
  const { t } = useTranslation()
  const noTaxCodeOption = useMemo<TaxCodeComboBoxOption>(
    () => TaxCodeComboBoxOption.noTaxCode(t('bankTransactions:action.no_tax_code', 'No tax code')),
    [t],
  )

  const allOptions = useMemo<TaxCodeComboBoxOption[]>(
    () => [noTaxCodeOption, ...options],
    [noTaxCodeOption, options],
  )

  const selectedValue = useMemo<TaxCodeComboBoxOption>(
    () => value ?? noTaxCodeOption,
    [value, noTaxCodeOption],
  )

  const handleChange = useCallback((next: TaxCodeComboBoxOption | null) => {
    if (next === null || next.value === NO_TAX_CODE) {
      onChange(null)
      return
    }

    onChange(options.find(option => option.value === next.value) ?? null)
  }, [onChange, options])

  return {
    allOptions,
    selectedValue,
    handleChange,
    placeholder: t('bankTransactions:action.select_tax_code', 'Select tax code'),
  }
}

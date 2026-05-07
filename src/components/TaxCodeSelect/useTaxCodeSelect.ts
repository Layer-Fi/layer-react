import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { NO_TAX_CODE, TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

type UseTaxCodeSelectParams = {
  options?: ReadonlyArray<TaxCodeComboBoxOption>
  selectedValue: TaxCodeComboBoxOption | null
  onSelectedValueChange: (value: TaxCodeComboBoxOption | null) => void
}

type UseTaxCodeSelectReturn = {
  options: ReadonlyArray<TaxCodeComboBoxOption>
  selectedValue: TaxCodeComboBoxOption
  onSelectedValueChange: (value: TaxCodeComboBoxOption | null) => void
  placeholder: string
}

const EMPTY_ARRAY: ReadonlyArray<TaxCodeComboBoxOption> = []

export const useTaxCodeSelect = ({
  options = EMPTY_ARRAY,
  selectedValue,
  onSelectedValueChange,
}: UseTaxCodeSelectParams): UseTaxCodeSelectReturn => {
  const { t } = useTranslation()
  const noTaxCodeOption = useMemo<TaxCodeComboBoxOption>(
    () => TaxCodeComboBoxOption.noTaxCode(t('bankTransactions:action.no_tax_code', 'No tax code')),
    [t],
  )

  const optionsWithNoTaxCode = useMemo<TaxCodeComboBoxOption[]>(
    () => [noTaxCodeOption, ...options],
    [noTaxCodeOption, options],
  )

  const resolvedSelectedValue = useMemo<TaxCodeComboBoxOption>(
    () => selectedValue ?? noTaxCodeOption,
    [selectedValue, noTaxCodeOption],
  )

  const handleChange = useCallback((next: TaxCodeComboBoxOption | null) => {
    if (next === null || next.value === NO_TAX_CODE) {
      onSelectedValueChange(null)
      return
    }

    onSelectedValueChange(options.find(option => option.value === next.value) ?? null)
  }, [onSelectedValueChange, options])

  const placeholder = useMemo(
    () => t('bankTransactions:action.select_tax_code', 'Select tax code'),
    [t],
  )

  return useMemo<UseTaxCodeSelectReturn>(() => ({
    options: optionsWithNoTaxCode,
    selectedValue: resolvedSelectedValue,
    onSelectedValueChange: handleChange,
    placeholder,
  }), [optionsWithNoTaxCode, resolvedSelectedValue, handleChange, placeholder])
}

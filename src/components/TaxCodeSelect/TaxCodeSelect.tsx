import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronRight from '@icons/ChevronRight'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'

export const NO_TAX_CODE = '__no_tax_code__'

type Props = {
  options: ComboBoxOption[]
  value: ComboBoxOption | null
  onChange: (value: ComboBoxOption | null) => void
  isMobileView?: boolean
  isDisabled?: boolean
  inputId?: string
  className?: string
  placeholder?: string
}

export const TaxCodeSelect = ({
  options,
  value,
  onChange,
  isMobileView = false,
  isDisabled = false,
  inputId,
  className,
  placeholder,
}: Props) => {
  const { t } = useTranslation()

  const noTaxCodeOption = useMemo<ComboBoxOption>(() => ({
    value: NO_TAX_CODE,
    label: t('bankTransactions:action.no_tax_code', 'No tax code'),
  }), [t])

  const allOptions = useMemo(
    () => [noTaxCodeOption, ...options],
    [noTaxCodeOption, options],
  )

  const selectedValue = value ?? noTaxCodeOption

  const handleChange = useCallback((next: ComboBoxOption | null) => {
    onChange(next === null || next.value === NO_TAX_CODE ? null : next)
  }, [onChange])

  const resolvedPlaceholder = placeholder ?? t('bankTransactions:action.select_tax_code', 'Select tax code')

  if (isMobileView) {
    return (
      <MobileSelectionDrawerWithTrigger<ComboBoxOption>
        ariaLabel={t('bankTransactions:action.select_tax_code', 'Select tax code')}
        heading={t('bankTransactions:action.select_tax_code', 'Select tax code')}
        options={allOptions}
        selectedValue={selectedValue}
        onSelectedValueChange={handleChange}
        isDisabled={isDisabled}
        isSearchable
        searchPlaceholder={t('bankTransactions:action.search_tax_codes', 'Search tax codes...')}
        className={className}
        slotProps={{
          Trigger: {
            placeholder: resolvedPlaceholder,
            icon: <ChevronRight size={16} />,
          },
        }}
      />
    )
  }

  return (
    <ComboBox<ComboBoxOption>
      inputId={inputId}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      options={allOptions}
      isDisabled={isDisabled}
      isSearchable={false}
      isClearable
      placeholder={resolvedPlaceholder}
      className={className}
    />
  )
}

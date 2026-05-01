import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronRight from '@icons/ChevronRight'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { NO_TAX_CODE, type TaxCodeSelectOption } from '@components/TaxCodeSelect/constants'

type Props = {
  options: TaxCodeSelectOption[]
  value: TaxCodeSelectOption | null
  onChange: (value: TaxCodeSelectOption | null) => void
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

  const noTaxCodeOption = useMemo<TaxCodeSelectOption>(() => ({
    value: NO_TAX_CODE,
    label: t('bankTransactions:action.no_tax_code', 'No tax code'),
  }), [t])

  const allOptions = useMemo(
    () => [noTaxCodeOption, ...options],
    [noTaxCodeOption, options],
  )

  const selectedValue = value ?? noTaxCodeOption

  const handleChange = useCallback((next: TaxCodeSelectOption | null) => {
    onChange(next === null || next.value === NO_TAX_CODE ? null : next)
  }, [onChange])

  const resolvedPlaceholder = placeholder ?? t('bankTransactions:action.select_tax_code', 'Select tax code')

  if (isMobileView) {
    return (
      <MobileSelectionDrawerWithTrigger<TaxCodeSelectOption>
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
    <ComboBox<TaxCodeSelectOption>
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

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronRight from '@icons/ChevronRight'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { NO_TAX_CODE, type TaxCodeSelectOption } from '@components/TaxCodeSelect/constants'

type Props = {
  options: TaxCodeSelectOption[]
  value: TaxCodeSelectOption | null
  onChange: (newValue: TaxCodeSelectOption | null) => void
  isDisabled?: boolean
  hasSelection?: boolean
  className?: string
  placeholder?: string
}

export const TaxCodeSelectDrawerWithTrigger = ({
  options,
  value,
  onChange,
  isDisabled = false,
  hasSelection = true,
  className,
  placeholder,
}: Props) => {
  const { t } = useTranslation()

  const noTaxCodeOption = useMemo<TaxCodeSelectOption>(() => ({
    value: NO_TAX_CODE,
    label: t('bankTransactions:action.no_tax_code', 'No tax code'),
  }), [t])

  const drawerOptions = useMemo(
    () => [noTaxCodeOption, ...options],
    [noTaxCodeOption, options],
  )

  const selectedValue = hasSelection
    ? (value ?? noTaxCodeOption)
    : value

  const handleChange = useCallback((newValue: TaxCodeSelectOption | null) => {
    onChange(newValue?.value === NO_TAX_CODE ? null : newValue)
  }, [onChange])

  return (
    <MobileSelectionDrawerWithTrigger<TaxCodeSelectOption>
      ariaLabel={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      heading={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      options={drawerOptions}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      placeholder={placeholder ?? t('bankTransactions:action.select_tax_code', 'Select tax code')}
      isDisabled={isDisabled}
      isSearchable
      searchPlaceholder={t('bankTransactions:action.search_tax_codes', 'Search tax codes...')}
      slotProps={{ Trigger: { icon: <ChevronRight size={16} /> } }}
      className={className}
    />
  )
}

import { useTranslation } from 'react-i18next'

import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { useTaxCodeSelect } from '@components/TaxCodeSelect/useTaxCodeSelect'

type TaxCodeMobileDrawerProps = {
  options: TaxCodeComboBoxOption[]
  value: TaxCodeComboBoxOption | null
  onChange: (value: TaxCodeComboBoxOption | null) => void
  isDisabled?: boolean
}

export const TaxCodeMobileDrawer = ({
  options,
  value,
  onChange,
  isDisabled = false,
}: TaxCodeMobileDrawerProps) => {
  const { t } = useTranslation()
  const { allOptions, selectedValue, handleChange, placeholder } = useTaxCodeSelect({
    options,
    value,
    onChange,
  })

  return (
    <MobileSelectionDrawerWithTrigger<TaxCodeComboBoxOption>
      ariaLabel={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      heading={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      options={allOptions}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      isDisabled={isDisabled}
      isSearchable
      searchPlaceholder={t('bankTransactions:action.search_tax_codes', 'Search tax codes...')}
      placeholder={placeholder}
    />
  )
}

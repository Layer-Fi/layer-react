import { useTranslation } from 'react-i18next'

import ChevronRight from '@icons/ChevronRight'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { type TaxCodeSelectCommonProps } from '@components/TaxCodeSelect/types'
import { useTaxCodeSelect } from '@components/TaxCodeSelect/useTaxCodeSelect'

type TaxCodeMobileDrawerProps = TaxCodeSelectCommonProps

export const TaxCodeMobileDrawer = ({
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
}: TaxCodeMobileDrawerProps) => {
  const { t } = useTranslation()
  const taxCodeSelectProps = useTaxCodeSelect({
    options,
    selectedValue,
    onSelectedValueChange,
  })

  return (
    <MobileSelectionDrawerWithTrigger<TaxCodeComboBoxOption>
      ariaLabel={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      heading={t('bankTransactions:action.select_tax_code', 'Select tax code')}
      {...taxCodeSelectProps}
      isDisabled={isDisabled}
      isSearchable
      searchPlaceholder={t('bankTransactions:action.search_tax_codes', 'Search tax codes...')}
      slotProps={{
        Trigger: {
          icon: <ChevronRight size={16} />,
        },
      }}
    />
  )
}

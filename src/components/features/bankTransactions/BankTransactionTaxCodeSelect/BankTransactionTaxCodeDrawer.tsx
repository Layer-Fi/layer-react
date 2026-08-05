import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TaxCodeComboBoxOption } from '@utils/features/bankTransactions/taxCodeComboBoxOption'
import { MobileSelectionDrawerWithTrigger } from '@blocks/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { type TaxCodeSelectCommonProps } from '@features/bankTransactions/BankTransactionTaxCodeSelect/types'
import { useBankTransactionTaxCodeSelect } from '@features/bankTransactions/BankTransactionTaxCodeSelect/useBankTransactionTaxCodeSelect'

type TaxCodeMobileDrawerProps = TaxCodeSelectCommonProps

export const BankTransactionTaxCodeDrawer = ({
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
}: TaxCodeMobileDrawerProps) => {
  const { t } = useTranslation()
  const taxCodeSelectProps = useBankTransactionTaxCodeSelect({
    options,
    selectedValue,
    onSelectedValueChange,
  })

  return (
    <MobileSelectionDrawerWithTrigger<TaxCodeComboBoxOption>
      ariaLabel={t('bankTransactions:BankTransactionTaxCodeSelect.BankTransactionTaxCodeDrawer.action.select_tax_code', 'Select tax code')}
      heading={t('bankTransactions:BankTransactionTaxCodeSelect.BankTransactionTaxCodeDrawer.action.select_tax_code', 'Select tax code')}
      {...taxCodeSelectProps}
      isDisabled={isDisabled}
      isSearchable
      searchPlaceholder={t('bankTransactions:BankTransactionTaxCodeSelect.BankTransactionTaxCodeDrawer.action.search_tax_codes', 'Search tax codes...')}
      slotProps={{
        Trigger: {
          icon: <ChevronRight size={16} />,
        },
      }}
    />
  )
}

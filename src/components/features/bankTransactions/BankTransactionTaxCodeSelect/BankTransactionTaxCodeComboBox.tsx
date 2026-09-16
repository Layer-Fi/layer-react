import { type TaxCodeComboBoxOption } from '@utils/features/bankTransactions/taxCodeComboBoxOption'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type TaxCodeSelectCommonProps } from '@features/bankTransactions/BankTransactionTaxCodeSelect/types'
import { useBankTransactionTaxCodeSelect } from '@features/bankTransactions/BankTransactionTaxCodeSelect/useBankTransactionTaxCodeSelect'

type TaxCodeComboBoxProps = TaxCodeSelectCommonProps & {
  inputId?: string
}

export const BankTransactionTaxCodeComboBox = ({
  className,
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
  inputId,
}: TaxCodeComboBoxProps) => {
  const taxCodeSelectProps = useBankTransactionTaxCodeSelect({
    options,
    selectedValue,
    onSelectedValueChange,
  })

  return (
    <ComboBox<TaxCodeComboBoxOption>
      className={className}
      inputId={inputId}
      {...taxCodeSelectProps}
      isDisabled={isDisabled}
      isSearchable
      isClearable
    />
  )
}

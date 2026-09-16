import { BankTransactionTaxCodeComboBox } from '@features/bankTransactions/BankTransactionTaxCodeSelect/BankTransactionTaxCodeComboBox'
import { BankTransactionTaxCodeDrawer } from '@features/bankTransactions/BankTransactionTaxCodeSelect/BankTransactionTaxCodeDrawer'
import { type TaxCodeSelectCommonProps } from '@features/bankTransactions/BankTransactionTaxCodeSelect/types'

type TaxCodeSelectProps = TaxCodeSelectCommonProps & {
  isMobile?: boolean
  inputId?: string
}

export const BankTransactionTaxCodeSelect = ({
  isMobile = false,
  inputId,
  className,
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
}: TaxCodeSelectProps) => {
  const sharedProps = {
    className,
    options,
    selectedValue,
    onSelectedValueChange,
    isDisabled,
  }

  if (isMobile) {
    return <BankTransactionTaxCodeDrawer {...sharedProps} />
  }

  return <BankTransactionTaxCodeComboBox inputId={inputId} {...sharedProps} />
}

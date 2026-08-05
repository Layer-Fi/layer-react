import { type TaxCodeComboBoxOption } from '@utils/features/bankTransactions/taxCodeComboBoxOption'
import { type SingleSelectComboBoxProps } from '@ui/ComboBox/types'

export type TaxCodeSelectCommonProps = Pick<
  SingleSelectComboBoxProps<TaxCodeComboBoxOption>,
  'className' | 'isDisabled' | 'onSelectedValueChange' | 'selectedValue' | 'options'
>

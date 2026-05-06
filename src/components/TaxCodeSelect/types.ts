import { type SingleSelectComboBoxProps } from '@ui/ComboBox/types'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export type TaxCodeSelectCommonProps = Pick<
  SingleSelectComboBoxProps<TaxCodeComboBoxOption>,
  'className' | 'isDisabled' | 'onSelectedValueChange' | 'selectedValue' | 'options'
>

import { type TaxCodeComboBoxOption } from '@internal-types/taxCodeComboBoxOption'
import { type SingleSelectComboBoxProps } from '@ui/ComboBox/types'

export type TaxCodeSelectCommonProps = Pick<
  SingleSelectComboBoxProps<TaxCodeComboBoxOption>,
  'className' | 'isDisabled' | 'onSelectedValueChange' | 'selectedValue' | 'options'
>

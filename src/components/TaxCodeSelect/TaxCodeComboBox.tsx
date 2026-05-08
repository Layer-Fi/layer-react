import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { type TaxCodeSelectCommonProps } from '@components/TaxCodeSelect/types'
import { useTaxCodeSelect } from '@components/TaxCodeSelect/useTaxCodeSelect'

type TaxCodeComboBoxProps = TaxCodeSelectCommonProps & {
  inputId?: string
}

export const TaxCodeComboBox = ({
  className,
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
  inputId,
}: TaxCodeComboBoxProps) => {
  const taxCodeSelectProps = useTaxCodeSelect({
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

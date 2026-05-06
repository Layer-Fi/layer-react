import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { type TaxCodeSelectCommonProps } from '@components/TaxCodeSelect/types'
import { useTaxCodeSelect } from '@components/TaxCodeSelect/useTaxCodeSelect'

const EMPTY_ARRAY: ReadonlyArray<TaxCodeComboBoxOption> = []

type TaxCodeComboBoxProps = TaxCodeSelectCommonProps & {
  inputId?: string
}

export const TaxCodeComboBox = ({
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
  const { options: taxCodeOptions = EMPTY_ARRAY, selectedValue: resolvedSelectedValue, onSelectedValueChange: handleChange, placeholder } = taxCodeSelectProps

  return (
    <ComboBox<TaxCodeComboBoxOption>
      inputId={inputId}
      options={taxCodeOptions}
      selectedValue={resolvedSelectedValue}
      onSelectedValueChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isSearchable
      isClearable
    />
  )
}

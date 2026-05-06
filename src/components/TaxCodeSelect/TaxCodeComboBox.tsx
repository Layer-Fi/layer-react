import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { useTaxCodeSelect } from '@components/TaxCodeSelect/useTaxCodeSelect'

type TaxCodeComboBoxProps = {
  options: TaxCodeComboBoxOption[]
  value: TaxCodeComboBoxOption | null
  onChange: (value: TaxCodeComboBoxOption | null) => void
  isDisabled?: boolean
  inputId?: string
  className?: string
}

export const TaxCodeComboBox = ({
  options,
  value,
  onChange,
  isDisabled = false,
  inputId,
  className,
}: TaxCodeComboBoxProps) => {
  const { allOptions, selectedValue, handleChange, placeholder } = useTaxCodeSelect({
    options,
    value,
    onChange,
  })

  return (
    <ComboBox<TaxCodeComboBoxOption>
      inputId={inputId}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      options={allOptions}
      isDisabled={isDisabled}
      isSearchable
      isClearable
      placeholder={placeholder}
      className={className}
    />
  )
}

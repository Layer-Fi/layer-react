import { useVendorsContext, VendorsProvider } from '../../contexts/VendorsContext'
import { Vendor } from '../../types/vendors'
import { getVendorName } from '../../utils/vendors'
import { Select } from '../Input/Select'

type SelectVendorProps = {
  value: Vendor | null
  onChange: (value: Vendor | null) => void
  disabled?: boolean
  placeholder?: string
  withContext?: boolean
}

export const SelectVendor = ({ withContext = true, ...props }: SelectVendorProps) => {
  if (withContext) {
    return (
      <VendorsProvider>
        <SelectVendorContent {...props} />
      </VendorsProvider>
    )
  }

  return (
    <SelectVendorContent {...props} />
  )
}

const SelectVendorContent = ({
  value,
  onChange,
  disabled,
  placeholder = 'Select vendor',
}: Omit<SelectVendorProps, 'withContext'>) => {
  const { data } = useVendorsContext()

  return (
    <Select
      options={data.map(x => ({ label: getVendorName(x), value: x }))}
      value={value
        ? { label: getVendorName(value), value: value }
        : null}
      onChange={selectedOption => onChange(selectedOption?.value ?? null)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

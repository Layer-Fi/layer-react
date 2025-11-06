import { useVendorsContext, VendorsProvider } from '@contexts/VendorsContext'
import { Vendor } from '@internal-types/vendors'
import { getVendorName } from '@utils/vendors'
import { Select } from '@components/Input/Select'

type SelectVendorProps = {
  value: Vendor | null
  onChange: (value: Vendor | null) => void
  disabled?: boolean
  placeholder?: string
  withContext?: boolean
  isInvalid?: boolean
  errorMessage?: string
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
  placeholder = 'Select vendor',
  ...props
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
      {...props}
    />
  )
}

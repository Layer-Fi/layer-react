import { type Customer } from '@schemas/customer'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type RecordTransactionCounterparty, type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { VendorSelector } from '@components/VendorSelector/VendorSelector'

type RecordTransactionCounterpartySelectorProps = {
  variant: RecordTransactionVariant
  label: string
  placeholder: string
  isInvalid: boolean
  value: RecordTransactionCounterparty | null
  onChange: (value: RecordTransactionCounterparty | null) => void
}

export function RecordTransactionCounterpartySelector({ variant, label, placeholder, isInvalid, value, onChange }: RecordTransactionCounterpartySelectorProps) {
  const { accountingConfiguration } = useLayerContext()

  if (variant === 'expense') {
    return (
      <VendorSelector
        label={label}
        placeholder={placeholder}
        showLabel
        inline
        isInvalid={isInvalid}
        isCreatable={accountingConfiguration?.enableVendorManagement === true}
        selectedVendor={value}
        onSelectedVendorChange={onChange}
      />
    )
  }

  return (
    <CustomerSelector
      label={label}
      placeholder={placeholder}
      showLabel
      inline
      isInvalid={isInvalid}
      isCreatable={accountingConfiguration?.enableCustomerManagement === true}
      selectedCustomer={value as Customer | null}
      onSelectedCustomerChange={onChange}
    />
  )
}

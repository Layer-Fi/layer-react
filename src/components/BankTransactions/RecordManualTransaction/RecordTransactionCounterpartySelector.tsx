import { type Customer } from '@schemas/customer'
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

// The selectors gate creation on the customer/vendor management config flags internally, so we just opt in here.
export function RecordTransactionCounterpartySelector({ variant, label, placeholder, isInvalid, value, onChange }: RecordTransactionCounterpartySelectorProps) {
  if (variant === 'expense') {
    return (
      <VendorSelector
        label={label}
        placeholder={placeholder}
        showLabel
        inline
        isInvalid={isInvalid}
        isCreatable
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
      isCreatable
      selectedCustomer={value as Customer | null}
      onSelectedCustomerChange={onChange}
    />
  )
}

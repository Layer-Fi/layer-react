import { useCallback } from 'react'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Customer, UpsertCustomerSchema } from '@schemas/customer'
import { UpsertVendorSchema, type Vendor } from '@schemas/vendor'
import { UpsertCustomerMode, useUpsertCustomer } from '@hooks/api/businesses/[business-id]/customers/useUpsertCustomer'
import { UpsertVendorMode, useUpsertVendor } from '@hooks/api/businesses/[business-id]/vendors/useUpsertVendor'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type RecordTransactionCounterparty, type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { ErrorText } from '@components/Typography/ErrorText'
import { VendorSelector } from '@components/VendorSelector/VendorSelector'

const encodeUpsertCustomer = Schema.encodeSync(UpsertCustomerSchema)
const encodeUpsertVendor = Schema.encodeSync(UpsertVendorSchema)

type RecordTransactionCounterpartySelectorProps = {
  variant: RecordTransactionVariant
  label: string
  placeholder: string
  isInvalid: boolean
  value: RecordTransactionCounterparty | null
  onChange: (value: RecordTransactionCounterparty | null) => void
}

export function RecordTransactionCounterpartySelector({ variant, label, placeholder, isInvalid, value, onChange }: RecordTransactionCounterpartySelectorProps) {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()

  const { trigger: createCustomer, isError: isCreateCustomerError, reset: resetCreateCustomer } = useUpsertCustomer({ mode: UpsertCustomerMode.Create })
  const { trigger: createVendor, isError: isCreateVendorError, reset: resetCreateVendor } = useUpsertVendor({ mode: UpsertVendorMode.Create })

  const handleCreateCustomer = useCallback(async (individualName: string) => {
    try {
      onChange(await createCustomer(encodeUpsertCustomer({ individualName })))
    }
    catch (e) {
      console.error(e)
    }
  }, [createCustomer, onChange])

  const handleCreateVendor = useCallback(async (companyName: string) => {
    try {
      onChange(await createVendor(encodeUpsertVendor({ companyName })))
    }
    catch (e) {
      console.error(e)
    }
  }, [createVendor, onChange])

  const handleChangeVendor = useCallback((vendor: Vendor | null) => {
    resetCreateVendor()
    onChange(vendor)
  }, [resetCreateVendor, onChange])

  const handleChangeCustomer = useCallback((customer: Customer | null) => {
    resetCreateCustomer()
    onChange(customer)
  }, [resetCreateCustomer, onChange])

  if (variant === 'expense') {
    return (
      <>
        <VendorSelector
          label={label}
          placeholder={placeholder}
          showLabel
          inline
          isInvalid={isInvalid}
          isCreatable={accountingConfiguration?.enableVendorManagement === true}
          onCreateVendor={name => void handleCreateVendor(name)}
          selectedVendor={value}
          onSelectedVendorChange={handleChangeVendor}
        />
        {isCreateVendorError && (
          <div className='Layer__RecordTransactionForm__Error'>
            <ErrorText size='xs'>{t('bankTransactions:recordTransaction.error.create_vendor_failed', 'Could not create vendor. Please try again.')}</ErrorText>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <CustomerSelector
        label={label}
        placeholder={placeholder}
        showLabel
        inline
        isInvalid={isInvalid}
        isCreatable={accountingConfiguration?.enableCustomerManagement === true}
        onCreateCustomer={name => void handleCreateCustomer(name)}
        selectedCustomer={value as Customer | null}
        onSelectedCustomerChange={handleChangeCustomer}
      />
      {isCreateCustomerError && (
        <div className='Layer__RecordTransactionForm__Error'>
          <ErrorText size='xs'>{t('bankTransactions:recordTransaction.error.create_customer_failed', 'Could not create customer. Please try again.')}</ErrorText>
        </div>
      )}
    </>
  )
}

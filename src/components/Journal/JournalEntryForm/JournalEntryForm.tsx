import React, { forwardRef, useCallback, useImperativeHandle, useEffect } from 'react'
import { useJournalEntryForm } from './useJournalEntryForm'
import { useJournalNavigation } from '../../../providers/JournalStore/JournalStoreProvider'
import { Form } from '../../ui/Form/Form'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { JournalEntryLineItemsTable } from './JournalEntryLineItemsTable'
import { DataState, DataStateStatus } from '../../DataState'
import { AlertTriangle } from 'lucide-react'
import { TextSize } from '../../Typography'
import { flattenValidationErrors } from '../../../utils/form'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import { UpsertJournalEntryMode } from './useUpsertJournalEntry'
import './journalEntryForm.scss'
import { JournalConfig } from '../Journal'
import { usePreloadCustomers } from '../../../features/customers/api/useListCustomers'
import { usePreloadVendors } from '../../../features/vendors/api/useListVendors'
import { CustomerVendorSelector } from '../../../features/customerVendor/components/CustomerVendorSelector'
import { TagDimensionsGroup } from './TagDimensionsGroup'
import type { CustomerVendorSchema } from '../../../features/customerVendor/customerVendorSchemas'

type CustomerVendor = typeof CustomerVendorSchema.Type

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export type JournalEntryFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export type JournalEntryFormProps = {
  config: JournalConfig
  isReadOnly?: boolean
  onSuccess?: () => void
  onChangeFormState?: (formState: JournalEntryFormState) => void
}

export const JournalEntryForm = forwardRef<{ submit: () => Promise<void> }, JournalEntryFormProps>((props, ref) => {
  const { toJournalTable } = useJournalNavigation()

  const { config, isReadOnly = false, onSuccess, onChangeFormState } = props

  // Preload customers and vendors for the selector
  usePreloadCustomers()
  usePreloadVendors()

  const { form, formState, submitError } = useJournalEntryForm({
    onSuccess: onSuccess || toJournalTable,
    mode: UpsertJournalEntryMode.Create, // For now, only support create mode
  })

  // Notify parent component of form state changes
  useEffect(() => {
    if (onChangeFormState) {
      onChangeFormState(formState)
    }
  }, [formState, onChangeFormState])

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => ({
    submit: async () => {
      await form.handleSubmit()
    },
  }))

  return (
    <Form className={JOURNAL_ENTRY_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      {/* Error Display */}
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__FormError`} pis='xl' pbe='lg'>
                <DataState
                  icon={<AlertTriangle size={16} />}
                  status={DataStateStatus.failed}
                  title={validationErrors[0] || submitError}
                  titleSize={TextSize.md}
                  inline
                />
              </HStack>
            )
          }
        }}
      </form.Subscribe>

      {/* Entry Date Field - Following InvoiceForm Terms pattern */}
      <VStack gap='sm'>
        {/* Row 1: Entry Date Field (first column only) */}
        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <VStack gap='xs'>
            <form.AppField name='entryAt'>
              {field => <field.FormDateField label='Entry date' isReadOnly={isReadOnly} />}
            </form.AppField>
          </VStack>
          <div></div>
          {' '}
          {/* Empty space for second column */}
        </div>

        {/* Row 2: Reference Number and Created By Fields */}
        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <VStack gap='xs'>
            <form.AppField name='referenceNumber'>
              {field => (
                <field.FormTextField
                  label='Reference Number'
                  isReadOnly={isReadOnly}
                />
              )}
            </form.AppField>
          </VStack>

          <VStack gap='xs'>
            <form.AppField name='createdBy'>
              {field => (
                <field.FormTextField
                  label='Created By'
                  isReadOnly={isReadOnly}
                />
              )}
            </form.AppField>
          </VStack>
        </div>

        {/* Row 3: Customer/Vendor and TagDimensionsGroup */}
        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <VStack gap='xs'>
            <form.AppField name='customer'>
              {customerField => (
                <form.AppField name='vendor'>
                  {(vendorField) => {
                    // Determine current selection
                    const currentCustomerVendor = customerField.state.value
                      ? { ...customerField.state.value, customerVendorType: 'CUSTOMER' as const }
                      : vendorField.state.value
                        ? { ...vendorField.state.value, customerVendorType: 'VENDOR' as const }
                        : null

                    const handleSelectionChange = (selection: CustomerVendor | null) => {
                      if (selection?.customerVendorType === 'CUSTOMER') {
                        customerField.setValue(selection)
                        vendorField.setValue(null)
                      }
                      else if (selection?.customerVendorType === 'VENDOR') {
                        vendorField.setValue(selection)
                        customerField.setValue(null)
                      }
                      else {
                        customerField.setValue(null)
                        vendorField.setValue(null)
                      }
                    }

                    return (
                      <CustomerVendorSelector
                        selectedCustomerVendor={currentCustomerVendor}
                        onSelectedCustomerVendorChange={handleSelectionChange}
                        placeholder='Select customer or vendor'
                        isReadOnly={isReadOnly}
                      />
                    )
                  }}
                </form.AppField>
              )}
            </form.AppField>
          </VStack>
        </div>

        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <form.AppField name='tags'>
            {field => (
              <TagDimensionsGroup
                dimensionKeys={config?.form?.tagDimensionKeysInUse}
                value={field.state.value}
                onChange={field.setValue}
                showLabels={true}
                isReadOnly={isReadOnly}
              />
            )}
          </form.AppField>
        </div>
      </VStack>

      {/* Line Items Section - Following InvoiceForm LineItems pattern */}
      <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItems`} gap='md'>
        {/* Add Debit Account Section */}
        <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__DebitSection`} gap='md'>
          <JournalEntryLineItemsTable
            form={form}
            isReadOnly={isReadOnly}
            title='Add Debits'
            direction={LedgerEntryDirection.Debit}
            config={config}
          />
        </VStack>

        {/* Add Credit Account Section */}
        <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__CreditSection`} gap='md'>
          <JournalEntryLineItemsTable
            form={form}
            isReadOnly={isReadOnly}
            title='Add Credits'
            direction={LedgerEntryDirection.Credit}
            config={config}
          />
        </VStack>
      </VStack>

      {/* Memo Section - Following InvoiceForm Metadata pattern */}
      <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Metadata`} pbs='md'>
        <HStack justify='space-between' gap='xl'>
          <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__AdditionalTextFields`}>
            <form.AppField name='memo'>
              {field => <field.FormTextAreaField label='Memo' isReadOnly={isReadOnly} />}
            </form.AppField>
          </VStack>
        </HStack>
      </VStack>
    </Form>
  )
})
JournalEntryForm.displayName = 'JournalEntryForm'

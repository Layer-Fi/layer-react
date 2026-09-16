import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomerVendorSchema } from '@schemas/features/customerVendor/customerVendor'
import { LedgerEntryDirection } from '@schemas/features/generalLedger/ledgerEntryDirection'
import { flattenValidationErrors } from '@utils/shared/form/errors'
import { usePreloadCustomers } from '@api/businesses/[business-id]/customers/get'
import { UpsertJournalEntryMode } from '@api/businesses/[business-id]/ledger/journal-entries/post'
import { usePreloadVendors } from '@api/businesses/[business-id]/vendors/get'
import { useJournalNavigation } from '@providers/features/generalLedger/JournalStore/JournalStoreProvider'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Form } from '@ui/Form/Form'
import { Separator } from '@ui/Separator/Separator'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CustomerVendorSelector } from '@features/customerVendor/CustomerVendorSelector/CustomerVendorSelector'
import { JournalEntryLineItemsTable } from '@features/generalLedger/JournalEntryForm/JournalEntryLineItemsTable'
import { useJournalEntryForm } from '@features/generalLedger/JournalEntryForm/useJournalEntryForm'
import { TagDimensionsGroup } from '@features/tags/TagDimensionsGroup/TagDimensionsGroup'

import './journalEntryForm.scss'

type CustomerVendor = typeof CustomerVendorSchema.Type

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export type JournalEntryFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export type JournalEntryFormProps = {
  isReadOnly?: boolean
  onSuccess?: () => void
  onChangeFormState?: (formState: JournalEntryFormState) => void
  showTags?: boolean
  showCustomerVendor?: boolean
}

export const JournalEntryForm = forwardRef<{ submit: () => Promise<void> }, JournalEntryFormProps>((props, ref) => {
  const { t } = useTranslation()
  const { toJournalTable } = useJournalNavigation()

  const { isReadOnly = false, onSuccess, onChangeFormState, showTags = true, showCustomerVendor = true } = props

  usePreloadCustomers({ isEnabled: showCustomerVendor })
  usePreloadVendors({ isEnabled: showCustomerVendor })

  const { form, formState, submitError } = useJournalEntryForm({
    onSuccess: onSuccess || toJournalTable,
    mode: UpsertJournalEntryMode.Create, // For now, only support create mode
  })

  useEffect(() => {
    if (onChangeFormState) {
      onChangeFormState(formState)
    }
  }, [formState, onChangeFormState])

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
                  slotProps={{ Title: { size: 'md' } }}
                  inline
                />
              </HStack>
            )
          }
        }}
      </form.Subscribe>

      <VStack gap='sm'>
        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <VStack gap='xs'>
            <form.AppField name='entryAt'>
              {field => <field.FormDateField label={t('generalLedger:JournalEntryForm.label.entry_date', 'Entry date')} isReadOnly={isReadOnly} />}
            </form.AppField>
          </VStack>
          <div></div>
          {' '}
          {/* Empty space for second column */}
        </div>

        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <VStack gap='xs'>
            <form.AppField name='referenceNumber'>
              {field => (
                <field.FormTextField
                  label={t('common:label.reference_number', 'Reference number')}
                  isReadOnly={isReadOnly}
                />
              )}
            </form.AppField>
          </VStack>

          <VStack gap='xs'>
            <form.AppField name='createdBy'>
              {field => (
                <field.FormTextField
                  label={t('common:label.created_by', 'Created by')}
                  isReadOnly={isReadOnly}
                />
              )}
            </form.AppField>
          </VStack>
        </div>

        {showCustomerVendor && (
          <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
            <VStack gap='xs'>
              <form.AppField name='customer'>
                {customerField => (
                  <form.AppField name='vendor'>
                    {(vendorField) => {
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
                          placeholder={t('generalLedger:JournalEntryForm.action.select_customer_vendor', 'Select customer or vendor')}
                          isReadOnly={isReadOnly}
                        />
                      )
                    }}
                  </form.AppField>
                )}
              </form.AppField>
            </VStack>
          </div>
        )}

        <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Row`}>
          <form.AppField name='tags'>
            {field => (
              <TagDimensionsGroup
                value={field.state.value}
                onChange={field.setValue}
                showLabels={true}
                isReadOnly={isReadOnly}
                isEnabled={showTags}
              />
            )}
          </form.AppField>
        </div>
      </VStack>

      <VStack gap='md' pbs='lg'>
        <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__DebitSection`} gap='md'>
          <Separator />
          <JournalEntryLineItemsTable
            form={form}
            isReadOnly={isReadOnly}
            title={t('generalLedger:JournalEntryForm.action.add_debits', 'Add Debits')}
            direction={LedgerEntryDirection.Debit}
            showTags={showTags}
          />
        </VStack>

        <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__CreditSection`} gap='md' pbe='lg'>
          <Separator />
          <JournalEntryLineItemsTable
            form={form}
            isReadOnly={isReadOnly}
            title={t('generalLedger:JournalEntryForm.action.add_credits', 'Add Credits')}
            direction={LedgerEntryDirection.Credit}
            showTags={showTags}
          />
        </VStack>
      </VStack>

      <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Metadata`} pb='lg' pi='xl'>
        <HStack justify='space-between' gap='xl'>
          <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__AdditionalTextFields`}>
            <form.AppField name='memo'>
              {field => <field.FormTextAreaField label={t('common:label.memo', 'Memo')} isReadOnly={isReadOnly} />}
            </form.AppField>
          </VStack>
        </HStack>
      </VStack>
    </Form>
  )
})
JournalEntryForm.displayName = 'JournalEntryForm'

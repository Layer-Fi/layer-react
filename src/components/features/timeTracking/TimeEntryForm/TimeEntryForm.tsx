import { useCallback, useState } from 'react'
import { type CalendarDate } from '@internationalized/date'
import { AlertTriangle, Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/features/customerVendor/customer'
import { type TimeEntry } from '@schemas/features/timeTracking/timeEntry'
import { flattenValidationErrors } from '@utils/shared/form/errors'
import { useTimeTrackingServicesDrawer } from '@providers/features/timeTracking/TimeTrackingServicesDrawerProvider/TimeTrackingServicesDrawerProvider'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CustomerSelector } from '@features/customerVendor/CustomerSelector/CustomerSelector'
import { useTimeEntryForm } from '@features/timeTracking/TimeEntryForm/useTimeEntryForm'
import { TimeEntryServiceSelector } from '@features/timeTracking/TimeEntryServiceSelector/TimeEntryServiceSelector'

import './timeEntryForm.scss'

export type TimeEntryFormProps = {
  entry?: TimeEntry
  isReadOnly?: boolean
  onSuccess: (entry: TimeEntry) => void
}

type TimeEntryCustomerFieldProps = {
  value: string | null
  entryCustomer?: Customer | null
  isReadOnly?: boolean
  onChange: (customerId: string | null) => void
}

const TimeEntryCustomerField = ({ value, entryCustomer, isReadOnly, onChange }: TimeEntryCustomerFieldProps) => {
  const { t } = useTranslation()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null | undefined>(undefined)

  const resolvedSelectedCustomer = selectedCustomer === undefined
    ? (entryCustomer?.id === value ? entryCustomer : null)
    : (selectedCustomer?.id === value ? selectedCustomer : null)

  const handleSelectedCustomerChange = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer)
    onChange(customer?.id ?? null)
  }, [onChange])

  return (
    <CustomerSelector
      selectedCustomer={resolvedSelectedCustomer}
      onSelectedCustomerChange={handleSelectedCustomerChange}
      isReadOnly={isReadOnly}
      inline
      label={t('timeTracking:TimeEntryForm.label.customer_optional', 'Customer (optional)')}
      placeholder={t('timeTracking:TimeEntryForm.label.select_customer_short', 'Select a customer')}
      className='Layer__TimeEntryForm__Field__Customer'
      hideSpecifiedIdNotFoundError
    />
  )
}

export const TimeEntryForm = ({ onSuccess, entry, isReadOnly }: TimeEntryFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useTimeEntryForm({ onSuccess, entry })
  const { openServicesDrawer } = useTimeTrackingServicesDrawer()

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleCreateService = useCallback((name: string) => {
    openServicesDrawer({ startInCreateMode: true, initialName: name })
  }, [openServicesDrawer])

  return (
    <Form className='Layer__TimeEntryForm' onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className='Layer__TimeEntryForm__FormError'>
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

      <form.AppField name='date'>
        {field => (
          <field.FormDateField<CalendarDate>
            label={t('timeTracking:TimeEntryForm.label.entry_date', 'Entry date')}
            inline
            isReadOnly={isReadOnly}
            className='Layer__TimeEntryForm__Field__EntryDate'
          />
        )}
      </form.AppField>

      <form.AppField name='durationMinutes'>
        {field => (
          <field.FormNumberField
            label={t('timeTracking:TimeEntryForm.label.duration_minutes', 'Duration (minutes)')}
            inline
            isReadOnly={isReadOnly}
            placeholder={t('timeTracking:TimeEntryForm.label.enter_duration', 'Enter duration')}
            className='Layer__TimeEntryForm__Field__Duration'
          />
        )}
      </form.AppField>

      <form.Field name='serviceId'>
        {field => (
          <TimeEntryServiceSelector
            selectedServiceId={field.state.value}
            onSelectedServiceIdChange={value => field.handleChange(value ?? '')}
            isReadOnly={isReadOnly}
            inline
            className='Layer__TimeEntryForm__Field__Service'
            isCreatable={!isReadOnly}
            onCreateService={handleCreateService}
            hideSpecifiedIdNotFoundError
          />
        )}
      </form.Field>

      <form.Field name='customerId'>
        {field => (
          <TimeEntryCustomerField
            key={entry?.id ?? 'new'}
            value={field.state.value}
            entryCustomer={entry?.customer}
            isReadOnly={isReadOnly}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.AppField name='memo'>
        {field => (
          <field.FormTextAreaField
            label={t('timeTracking:TimeEntryForm.label.memo', 'Memo')}
            inline
            isReadOnly={isReadOnly}
            placeholder={t('timeTracking:TimeEntryForm.label.add_memo', 'Add memo')}
            className='Layer__TimeEntryForm__Field__Memo'
          />
        )}
      </form.AppField>

      {!isReadOnly && (
        <VStack justify='end' className='Layer__TimeEntryForm__Submit'>
          <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                isDisabled={!canSubmit}
                isPending={isSubmitting}
                onPress={() => { void form.handleSubmit() }}
              >
                <Save size={14} />
                {t('timeTracking:TimeEntryForm.action.save_entry', 'Save Entry')}
              </Button>
            )}
          </form.Subscribe>
        </VStack>
      )}
    </Form>
  )
}

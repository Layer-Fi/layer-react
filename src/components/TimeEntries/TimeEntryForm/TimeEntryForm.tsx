import { useCallback, useState } from 'react'
import { type CalendarDate } from '@internationalized/date'
import { AlertTriangle, Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { type TimeEntry } from '@schemas/timeTracking'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { useTimeEntryForm } from '@components/TimeEntries/TimeEntryForm/useTimeEntryForm'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'
import { TextSize } from '@components/Typography/Text'

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
      placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
      className='Layer__TimeEntryForm__Field__Customer'
    />
  )
}

export const TimeEntryForm = ({ onSuccess, entry, isReadOnly }: TimeEntryFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useTimeEntryForm({ onSuccess, entry })

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

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
                  titleSize={TextSize.md}
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
            label={t('timeTracking:label.entry_date', 'Entry date')}
            inline
            isReadOnly={isReadOnly}
            className='Layer__TimeEntryForm__Field__EntryDate'
          />
        )}
      </form.AppField>

      <form.AppField name='durationMinutes'>
        {field => (
          <field.FormNumberField
            label={t('timeTracking:label.duration_minutes', 'Duration (minutes)')}
            inline
            isReadOnly={isReadOnly}
            placeholder={t('timeTracking:label.enter_duration', 'Enter duration')}
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
            showAddServiceAction
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
            label={t('timeTracking:label.memo', 'Memo')}
            inline
            isReadOnly={isReadOnly}
            placeholder={t('timeTracking:label.add_memo', 'Add memo')}
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
                {t('timeTracking:action.save_entry', 'Save Entry')}
              </Button>
            )}
          </form.Subscribe>
        </VStack>
      )}
    </Form>
  )
}

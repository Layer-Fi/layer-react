import React, { forwardRef, useCallback, useImperativeHandle, useEffect } from 'react'
import { useJournalEntryForm } from './useJournalEntryForm'
import { useJournalNavigation } from '../../../providers/JournalStore/JournalStoreProvider'
import { Form } from '../../ui/Form/Form'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { JournalEntryLineItemsTable } from './JournalEntryLineItemsTable'
import { DataState, DataStateStatus } from '../../DataState'
import { AlertTriangle } from 'lucide-react'
import { TextSize } from '../../Typography'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import { UpsertJournalEntryMode } from './useUpsertJournalEntry'
import './journalEntryForm.scss'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'
const JOURNAL_ENTRY_FORM_FIELD_CSS_PREFIX = `${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field`

export type JournalEntryFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export type JournalEntryFormProps = {
  isReadOnly?: boolean
  onSuccess?: () => void
  onChangeFormState?: (formState: JournalEntryFormState) => void
}

export const JournalEntryForm = forwardRef<{ submit: () => Promise<void> }, JournalEntryFormProps>((props, ref) => {
  const { toJournalTable } = useJournalNavigation()

  const { isReadOnly = false, onSuccess, onChangeFormState } = props
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
      {submitError && (
        <HStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__FormError`}>
          <DataState
            icon={<AlertTriangle size={16} />}
            status={DataStateStatus.failed}
            title={submitError}
            titleSize={TextSize.md}
            inline
          />
        </HStack>
      )}

      {/* Entry Date Field - Top Left */}
      <HStack gap='xl' className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__EntryDate`}>
        <VStack gap='xs'>
          <form.AppField name='entryAt'>
            {field => <field.FormDateField label='Entry date' inline className={`${JOURNAL_ENTRY_FORM_FIELD_CSS_PREFIX}__EntryAt`} isReadOnly={isReadOnly} />}
          </form.AppField>
        </VStack>
      </HStack>

      {/* Add Debit Account Section */}
      <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__DebitSection`} gap='md'>
        <JournalEntryLineItemsTable
          form={form}
          isReadOnly={isReadOnly}
          title='Add Debit Account'
          direction={LedgerEntryDirection.Debit}
        />
      </VStack>

      {/* Add Credit Account Section */}
      <VStack className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__CreditSection`} gap='md'>
        <JournalEntryLineItemsTable
          form={form}
          isReadOnly={isReadOnly}
          title='Add Credit Account'
          direction={LedgerEntryDirection.Credit}
        />
      </VStack>

      {/* Memo Section */}
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

import { useCallback, useMemo } from 'react'
import { useStore } from '@tanstack/react-form'
import { VStack, HStack } from '../../ui/Stack/Stack'
import { Heading } from '../../ui/Typography/Heading'
import { JournalEntryLineItem } from './JournalEntryLineItem'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import { JournalConfig } from '../Journal'
import { Button } from '../../ui/Button/Button'
import { Span } from '../../ui/Typography/Text'

export interface JournalEntryLineItemsTableProps {
  form: AppForm<JournalEntryForm>
  isReadOnly: boolean
  title: string
  direction: LedgerEntryDirection
  config: JournalConfig
}

export const JournalEntryLineItemsTable = ({
  form,
  isReadOnly,
  title,
  direction,
  config,
}: JournalEntryLineItemsTableProps) => {
  // Get line items from form state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lineItems = useStore(form.store, state => state.values.lineItems) || []

  // Filter line items by direction and get their indices in the original array
  const displayLineItems = useMemo(() => {
    const filteredIndices: number[] = []
    lineItems.forEach((item: unknown, index: number) => {
      const lineItem = item as { direction: LedgerEntryDirection }
      if (lineItem.direction === direction) {
        filteredIndices.push(index)
      }
    })
    return filteredIndices
  }, [lineItems, direction])

  const handleAddLineItem = useCallback(() => {
    // TODO: Implement proper field array push when form supports it
    // Add a new line item with the correct direction for this section
  }, [])

  const handleRemoveLineItem = useCallback((_index: number) => {
    // TODO: Implement proper field array removal when form supports it
    // Allow deletion regardless of how many line items remain
    // Remove logic here
  }, [])

  return (
    <VStack gap='md' className='Layer__JournalEntryForm__LineItemsSection'>
      {/* Header Section - Following Figma design */}
      <HStack justify='space-between' align='center' className='Layer__JournalEntryForm__SectionHeader'>
        <Heading size='sm'>{title}</Heading>
      </HStack>

      {/* Line Items - Show filtered line items by direction with proper label logic */}
      <VStack gap='xs'>
        {displayLineItems.map((originalIndex, displayIndex) => (
          <JournalEntryLineItem
            key={originalIndex}
            form={form}
            index={originalIndex}
            config={config}
            isReadOnly={isReadOnly}
            onDeleteLine={() => handleRemoveLineItem(originalIndex)}
            showLabels={displayIndex === 0} // Show labels for first item in each section
          />
        ))}
      </VStack>

      {/* Empty State - Show when no line items exist for this direction */}
      {displayLineItems.length === 0 && (
        <VStack gap='md' align='center' className='empty-state' pbs='lg'>
          <p style={{ color: 'var(--color-text-subtle)', textAlign: 'center' }}>
            No
            {' '}
            {direction.toLowerCase()}
            {' '}
            line items added yet. Click &ldquo;Add Line Item&rdquo; to get started.
          </p>
        </VStack>
      )}
      {!isReadOnly && (
        <Button onPress={handleAddLineItem} variant='text'>
          <Span weight='normal' size='sm' variant='subtle'>
            Add next account
          </Span>
        </Button>
      )}

    </VStack>
  )
}

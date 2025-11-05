import { Heading } from '../../ui/Typography/Heading'
import { Button } from '../../ui/Button/Button'
import { VStack, HStack } from '../../ui/Stack/Stack'
import { JournalEntryLineItem } from './JournalEntryLineItem'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import { P, Span } from '../../ui/Typography/Text'
import { getJournalEntryLineItemFormDefaultValues } from './formUtils'
import { useStore } from '@tanstack/react-form'
import { useMemo } from 'react'

export interface JournalEntryLineItemsTableProps {
  form: AppForm<JournalEntryForm>
  isReadOnly: boolean
  title: string
  direction: LedgerEntryDirection
  showTags?: boolean
}

const EMPTY_ARRAY: never[] = []
export const JournalEntryLineItemsTable = ({
  form,
  isReadOnly,
  title,
  direction,
  showTags = false,
}: JournalEntryLineItemsTableProps) => {
  const lineItems = useStore(form.store, state => state.values.lineItems || EMPTY_ARRAY)

  const filteredIndices = useMemo(() => {
    const indices: number[] = []
    lineItems.forEach((item: unknown, index: number) => {
      const lineItem = item as { direction: LedgerEntryDirection }
      if (lineItem.direction === direction) {
        indices.push(index)
      }
    })
    return indices
  }, [lineItems, direction])

  return (
    <VStack gap='md' pi='xl'>
      <form.Field name='lineItems' mode='array'>
        {(field) => {
          const displayLineItems = filteredIndices

          return (
            <>
              <HStack
                justify='space-between'
                align='center'
                pbe='md'
              >
                <Heading size='xs'>{title}</Heading>
              </HStack>

              <VStack gap='xs'>
                {displayLineItems.map((originalIndex, displayIndex) => (
                  <JournalEntryLineItem
                    key={originalIndex}
                    form={form}
                    index={originalIndex}
                    isReadOnly={isReadOnly}
                    onDeleteLine={() => field.removeValue(originalIndex)}
                    showLabels={displayIndex === 0}
                    showTags={showTags}
                  />
                ))}
              </VStack>

              {displayLineItems.length === 0 && (
                <VStack gap='md' align='center' className='empty-state'>
                  <P variant='subtle' align='center' size='sm'>
                    No
                    {' '}
                    {direction.toLowerCase()}
                    {' '}
                    line items added yet. Click &ldquo;Add next line&rdquo; to get started.
                  </P>
                </VStack>
              )}
              {!isReadOnly && (
                <Button onPress={() => field.pushValue(getJournalEntryLineItemFormDefaultValues(direction))} variant='text'>
                  <Span weight='normal' size='sm' variant='subtle'>
                    Add next line
                  </Span>
                </Button>
              )}
            </>
          )
        }}
      </form.Field>
    </VStack>
  )
}

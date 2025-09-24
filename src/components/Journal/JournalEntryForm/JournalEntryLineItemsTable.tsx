import { VStack, HStack } from '../../ui/Stack/Stack'
import { Heading } from '../../ui/Typography/Heading'
import { JournalEntryLineItem } from './JournalEntryLineItem'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import { JournalConfig } from '../Journal'
import { Button } from '../../ui/Button/Button'
import { P, Span } from '../../ui/Typography/Text'
import { Separator } from '../../Separator/Separator'
import { getJournalEntryLineItemFormDefaultValues } from './formUtils'

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
  return (
    <>
      <Separator />
      <VStack gap='md' pbs='lg' className='Layer__JournalEntryForm__LineItemsSection'>
        <form.Field name='lineItems' mode='array'>
          {(field) => {
            const lineItems = field.state.value || []

            // Filter line items by direction and get their indices in the original array
            const filteredIndices: number[] = []
            lineItems.forEach((item: unknown, index: number) => {
              const lineItem = item as { direction: LedgerEntryDirection }
              if (lineItem.direction === direction) {
                filteredIndices.push(index)
              }
            })
            const displayLineItems = filteredIndices

            const handleAddLineItem = () => {
              const newLineItem = getJournalEntryLineItemFormDefaultValues(direction)
              field.pushValue(newLineItem)
            }

            const handleRemoveLineItem = (index: number) => {
              field.removeValue(index)
            }

            return (
              <>
                {/* Header Section - Following Figma design */}
                <HStack justify='space-between' align='center' className='Layer__JournalEntryForm__SectionHeader'>
                  <Heading size='xs'>{title}</Heading>
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
                  <VStack gap='md' align='center' className='empty-state'>
                    <P variant='subtle' align='center' size='sm'>
                      No
                      {' '}
                      {direction.toLowerCase()}
                      {' '}
                      line items added yet. Click &ldquo;Add next account&rdquo; to get started.
                    </P>
                  </VStack>
                )}
                {!isReadOnly && (
                  <Button onPress={handleAddLineItem} variant='text'>
                    <Span weight='normal' size='sm' variant='subtle'>
                      Add next account
                    </Span>
                  </Button>
                )}
              </>
            )
          }}
        </form.Field>
      </VStack>
    </>
  )
}

import { useMemo } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import type { AppForm } from '@hooks/features/forms/useForm'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'
import { getJournalEntryLineItemFormDefaultValues } from '@components/Journal/JournalEntryForm/formUtils'
import type { JournalEntryForm } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'
import { JournalEntryLineItem } from '@components/Journal/JournalEntryForm/JournalEntryLineItem'

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
  const { t } = useTranslation()
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
                    displayIndex={displayIndex}
                    isReadOnly={isReadOnly}
                    onDeleteLine={() => field.removeValue(originalIndex)}
                    showTags={showTags}
                  />
                ))}
              </VStack>

              {displayLineItems.length === 0 && (
                <VStack gap='md' align='center' className='empty-state'>
                  <P variant='subtle' align='center' size='sm'>
                    {direction === LedgerEntryDirection.Debit
                      ? t('generalLedger:noDebitLineItemsAddedYet', 'No debit line items added yet. Click "Add next line" to get started.')
                      : t('generalLedger:noCreditLineItemsAddedYet', 'No credit line items added yet. Click "Add next line" to get started.')}
                  </P>
                </VStack>
              )}
              {!isReadOnly && (
                <HStack justify='start'>
                  <Button onPress={() => field.pushValue(getJournalEntryLineItemFormDefaultValues(direction))} variant='text'>
                    <Span weight='normal' size='sm' variant='subtle'>
                      {t('generalLedger:addNextLine', 'Add next line')}
                    </Span>
                  </Button>
                </HStack>
              )}
            </>
          )
        }}
      </form.Field>
    </VStack>
  )
}

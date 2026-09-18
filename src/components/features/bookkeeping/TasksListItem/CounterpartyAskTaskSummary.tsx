import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CounterpartyAskTransactionRowSummary } from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRowSummary'

export type CounterpartyAskAnsweredRow = {
  transaction: MinimalBankTransaction
  label: string
}

type CounterpartyAskTaskSummaryProps = {
  title: string
  answer?: string
  rows?: readonly CounterpartyAskAnsweredRow[]
  detail?: string
  note?: string
  onEdit?: () => void
}

export const CounterpartyAskTaskSummary = ({
  title,
  answer,
  rows,
  detail,
  note,
  onEdit,
}: CounterpartyAskTaskSummaryProps) => {
  const { t } = useTranslation()

  const hasRows = Boolean(rows?.length)

  const editButton = onEdit
    ? (
      <HStack>
        <Button variant='text' onPress={onEdit}>
          {t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskSummary.action.change_answer',
            'Change answer',
          )}
        </Button>
      </HStack>
    )
    : null

  return (
    <VStack gap='sm' pb='sm'>
      <HStack gap='sm' pi='md'>
        <Span
          className='Layer__CounterpartyAskTask__SummaryIcon'
          aria-label={t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskSummary.label.answered',
            'Answered',
          )}
        >
          <Check size={14} />
        </Span>
        <VStack gap='3xs'>
          <Span weight='bold'>{title}</Span>
          {answer
            ? (
              <HStack>
                <Badge size={BadgeSize.SMALL} variant={BadgeVariant.NEUTRAL}>{answer}</Badge>
              </HStack>
            )
            : null}
          {detail ? <Span size='sm' variant='subtle'>{detail}</Span> : null}
          {note ? <Span size='xs' variant='subtle'>{note}</Span> : null}
          {hasRows ? null : editButton}
        </VStack>
      </HStack>
      {hasRows
        ? (
          <VStack className='Layer__CounterpartyAskTask__Rows'>
            {rows?.map(({ transaction, label }) => (
              <VStack
                key={transaction.id}
                className='Layer__CounterpartyAskTask__Row Layer__CounterpartyAskTask__RowSummary'
                pi='md'
              >
                <CounterpartyAskTransactionRowSummary transaction={transaction} answerLabel={label} />
              </VStack>
            ))}
          </VStack>
        )
        : null}
      {hasRows ? <VStack pi='md'>{editButton}</VStack> : null}
    </VStack>
  )
}

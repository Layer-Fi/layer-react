import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type CounterpartyAskTaskSummaryProps = {
  title: string
  detail: string
  note?: string
}

export const CounterpartyAskTaskSummary = ({
  title,
  detail,
  note,
}: CounterpartyAskTaskSummaryProps) => {
  const { t } = useTranslation()

  return (
    <HStack gap='sm' pb='sm'>
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
        <Span size='sm' variant='subtle'>{detail}</Span>
        {note ? <Span size='xs' variant='subtle'>{note}</Span> : null}
      </VStack>
    </HStack>
  )
}

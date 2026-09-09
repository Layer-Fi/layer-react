import { useTranslation } from 'react-i18next'

import { type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

export const OTHER_ANSWER_KEY = 'other'

export const toSuggestionAnswerKey = (index: number) => `suggestion-${index}`

type CounterpartyAskTransactionRowProps = {
  transaction: MinimalBankTransaction
  suggestions: readonly CounterpartyAskAccount[]
  selectedKey: string | null
  text: string
  onSelect: (key: string) => void
  onChangeText: (text: string) => void
}

export const CounterpartyAskTransactionRow = ({
  transaction,
  suggestions,
  selectedKey,
  text,
  onSelect,
  onChangeText,
}: CounterpartyAskTransactionRowProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  return (
    <VStack className='Layer__CounterpartyAskTask__Row' gap='2xs' pb='2xs' pi='2xs'>
      <HStack align='baseline' gap='xs'>
        <MoneySpan size='sm' weight='bold' amount={transaction.amount} />
        <Span size='xs' variant='subtle' ellipsis noWrap>
          {`${formatDate(transaction.date, DateFormat.MonthDayShort)} · ${transaction.description ?? ''}`}
        </Span>
      </HStack>
      <ChipGroup
        ariaLabel={t(
          'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.label.answer_for_transaction',
          'What this one was for',
        )}
        value={selectedKey}
        onChange={onSelect}
        wrap
      >
        {suggestions.map((suggestion, index) => (
          <Chip key={toSuggestionAnswerKey(index)} size='sm' value={toSuggestionAnswerKey(index)}>
            {suggestion.name}
          </Chip>
        ))}
        <Chip size='sm' value={OTHER_ANSWER_KEY}>
          {t(
            'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.action.something_else',
            'Something else',
          )}
        </Chip>
      </ChipGroup>
      {selectedKey === OTHER_ANSWER_KEY
        ? (
          <InputGroup>
            <Input
              value={text}
              placeholder={t(
                'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.placeholder.what_was_this_for',
                'What was this one for?',
              )}
              onChange={event => onChangeText(event.target.value)}
              inset
            />
          </InputGroup>
        )
        : null}
    </VStack>
  )
}

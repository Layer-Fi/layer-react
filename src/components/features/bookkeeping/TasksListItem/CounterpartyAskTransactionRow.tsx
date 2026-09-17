import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
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
  answerLabel: string | null
  isDisabled: boolean
  isOpen: boolean
  onOpen: () => void
  onSelect: (key: string) => void
  onChangeText: (text: string) => void
  onCommitText: () => void
}

export const CounterpartyAskTransactionRow = ({
  transaction,
  suggestions,
  selectedKey,
  text,
  answerLabel,
  isDisabled,
  isOpen,
  onOpen,
  onSelect,
  onChangeText,
  onCommitText,
}: CounterpartyAskTransactionRowProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  return (
    <VStack
      className={classNames(
        'Layer__CounterpartyAskTask__Row',
        isOpen && 'Layer__CounterpartyAskTask__Row--open',
      )}
      pi='md'
    >
      <Button
        className='Layer__CounterpartyAskTask__RowSummary'
        variant='text'
        fullWidth
        isDisabled={isDisabled}
        onPress={onOpen}
      >
        <HStack align='center' gap='xs' overflow='hidden' fluid>
          <MoneySpan
            className='Layer__CounterpartyAskTask__RowSummaryAmount'
            size='sm'
            weight='bold'
            numeric='tabular-nums'
            amount={transaction.amount}
            displayPlusSign={transaction.direction === BankTransactionDirection.Credit}
          />
          <Span size='2xs' variant='subtle' noWrap>
            {formatDate(transaction.date, DateFormat.MonthDayShort)}
          </Span>
          <Span
            className='Layer__CounterpartyAskTask__RowSummaryDescription'
            size='xs'
            variant='subtle'
            ellipsis
            noWrap
          >
            {transaction.description ?? ''}
          </Span>
          {answerLabel
            ? (
              <Span
                className='Layer__CounterpartyAskTask__RowSummaryAnswer'
                size='xs'
                align='right'
                ellipsis
                noWrap
              >
                {answerLabel}
              </Span>
            )
            : null}
        </HStack>
      </Button>
      {isOpen
        ? (
          <VStack gap='2xs' pb='2xs'>
            <Span size='xs'>
              {t(
                'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.label.select_category',
                'Select category',
              )}
            </Span>
            <ChipGroup
              ariaLabel={t(
                'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.label.answer_for_transaction',
                'What this one was for',
              )}
              value={selectedKey}
              onChange={onSelect}
              isDisabled={isDisabled}
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
                    disabled={isDisabled}
                    onChange={event => onChangeText(event.target.value)}
                    onBlur={onCommitText}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onCommitText()
                    }}
                    inset
                  />
                </InputGroup>
              )
              : null}
          </VStack>
        )
        : null}
    </VStack>
  )
}

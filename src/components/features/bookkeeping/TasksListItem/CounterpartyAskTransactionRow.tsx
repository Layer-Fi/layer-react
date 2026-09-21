import { useStore } from '@tanstack/react-form'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { getCounterpartyAskAnswerLabel } from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import {
  OTHER_ANSWER_KEY,
  resolveCounterpartyAskAnswer,
  toSuggestionOptions,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { type CounterpartyAskForm } from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

type CounterpartyAskTransactionRowProps = {
  form: CounterpartyAskForm
  index: number
  transaction: MinimalBankTransaction
  suggestions: readonly CounterpartyAskAccount[]
  isDisabled: boolean
  isOpen: boolean
  onOpen: () => void
  /** The row holds a usable answer; the sheet moves on to the next unanswered row. */
  onAnswered: () => void
}

export const CounterpartyAskTransactionRow = ({
  form,
  index,
  transaction,
  suggestions,
  isDisabled,
  isOpen,
  onOpen,
  onAnswered,
}: CounterpartyAskTransactionRowProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const row = useStore(form.store, state => state.values.itemised.rows[index])

  const answer = row ? resolveCounterpartyAskAnswer(suggestions, row.answerKey, row.text) : null

  return (
    <VStack
      className={classNames('Layer__CounterpartyAskTask__Row', isOpen && 'Layer__CounterpartyAskTask__Row--open')}
      pi='md'
    >
      <Button
        className='Layer__CounterpartyAskTask__RowSummary'
        variant='text'
        underline={false}
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
          <Span className='Layer__CounterpartyAskTask__RowSummaryDate' size='xs' variant='subtle' noWrap>
            {formatDate(transaction.date, DateFormat.MonthDayShort)}
          </Span>
          <Span className='Layer__CounterpartyAskTask__RowSummaryDescription' size='sm' variant='subtle' ellipsis noWrap>
            {transaction.description ?? ''}
          </Span>
          {answer
            ? (
              <Span className='Layer__CounterpartyAskTask__RowSummaryAnswer' size='sm' align='right' ellipsis noWrap>
                {getCounterpartyAskAnswerLabel(answer)}
              </Span>
            )
            : null}
        </HStack>
      </Button>
      {isOpen
        ? (
          <VStack gap='2xs' pbe='xs' pbs='3xs'>
            <Span size='xs'>
              {t('bookkeeping:TasksListItem.CounterpartyAskTransactionRow.label.select_category', 'Select category')}
            </Span>
            <form.AppField name={`itemised.rows[${index}].answerKey`}>
              {field => (
                <field.FormChipGroupField
                  label={t(
                    'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.label.answer_for_transaction',
                    'What this one was for',
                  )}
                  showLabel={false}
                  size='sm'
                  isDisabled={isDisabled}
                  options={[
                    ...toSuggestionOptions(suggestions),
                    {
                      value: OTHER_ANSWER_KEY,
                      label: t(
                        'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.action.something_else',
                        'Something else',
                      ),
                    },
                  ]}
                  onSelect={(answerKey) => {
                    if (answerKey !== OTHER_ANSWER_KEY) onAnswered()
                  }}
                />
              )}
            </form.AppField>
            {row?.answerKey === OTHER_ANSWER_KEY
              ? (
                <form.Field name={`itemised.rows[${index}].text`}>
                  {field => (
                    <InputGroup>
                      <Input
                        value={field.state.value}
                        placeholder={t(
                          'bookkeeping:TasksListItem.CounterpartyAskTransactionRow.placeholder.what_was_this_for',
                          'What was this one for?',
                        )}
                        disabled={isDisabled}
                        onChange={event => field.handleChange(event.target.value)}
                        onBlur={onAnswered}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') onAnswered()
                        }}
                        inset
                      />
                    </InputGroup>
                  )}
                </form.Field>
              )
              : null}
          </VStack>
        )
        : null}
    </VStack>
  )
}

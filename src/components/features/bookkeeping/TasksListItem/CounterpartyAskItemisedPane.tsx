import { useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import {
  getAnsweredRows,
  getWholeAnswer,
  resolveCounterpartyAskAnswer,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { CounterpartyAskTransactionRow } from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRow'
import { type CounterpartyAskForm } from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

type CounterpartyAskItemisedPaneProps = {
  form: CounterpartyAskForm
  transactions: readonly MinimalBankTransaction[]
  suggestions: readonly CounterpartyAskAccount[]
  /** Every row agreed on one answer, so the flow continues to the going-forward step instead of saving. */
  onUniformAnswer: () => void
}

export const CounterpartyAskItemisedPane = ({
  form,
  transactions,
  suggestions,
  onUniformAnswer,
}: CounterpartyAskItemisedPaneProps) => {
  const { t } = useTranslation()

  const findNextUnanswered = useCallback(() =>
    form.state.values.rows.find(
      ({ answerKey, text }) => !resolveCounterpartyAskAnswer(suggestions, answerKey, text),
    )?.transactionId ?? null, [form, suggestions])

  const [openRowId, setOpenRowId] = useState(findNextUnanswered)

  const values = useStore(form.store, state => state.values)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const answeredCount = getAnsweredRows(suggestions, values.rows).length
  const isEveryRowAnswered = values.rows.length > 0 && answeredCount === values.rows.length
  const wholeAnswer = getWholeAnswer(suggestions, values)

  const openNextUnanswered = useCallback(() => setOpenRowId(findNextUnanswered()), [findNextUnanswered])

  const onSave = () => {
    if (wholeAnswer) {
      onUniformAnswer()
      return
    }

    form.setFieldValue('goingForward', null)
    void form.handleSubmit()
  }

  return (
    <VStack gap='sm'>
      <P size='sm' pi='md'>
        {t(
          'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.prompt.answer_each_transaction',
          'Can you share more about what each transaction was for below?',
        )}
      </P>
      <VStack className='Layer__CounterpartyAskTask__Rows'>
        {values.rows.map(({ transactionId }, index) => {
          const transaction = transactions.find(({ id }) => id === transactionId)

          return transaction
            ? (
              <CounterpartyAskTransactionRow
                key={transactionId}
                form={form}
                index={index}
                transaction={transaction}
                suggestions={suggestions}
                isDisabled={isSubmitting}
                isOpen={openRowId === transactionId}
                onOpen={() => setOpenRowId(transactionId)}
                onAnswered={openNextUnanswered}
              />
            )
            : null
        })}
      </VStack>
      <HStack className='Layer__CounterpartyAskTask__Footer' align='center' justify='space-between' gap='sm' pi='md'>
        <Span size='xs' variant='subtle'>
          {isEveryRowAnswered
            ? t(
              'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.all_rows_answered',
              'All {{total}} answered',
              { total: values.rows.length },
            )
            : t(
              'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.rows_answered',
              '{{answered}} of {{total}} answered',
              { answered: answeredCount, total: values.rows.length },
            )}
        </Span>
        <Button isDisabled={!isEveryRowAnswered || isSubmitting} onPress={onSave}>
          {t('common:action.save_label', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}

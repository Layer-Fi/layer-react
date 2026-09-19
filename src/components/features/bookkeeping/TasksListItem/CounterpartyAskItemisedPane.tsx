import { useCallback, useEffect, useState } from 'react'
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
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  const values = useStore(form.store, state => state.values)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const answeredCount = getAnsweredRows(suggestions, values.rows).length
  const isEveryRowAnswered = transactions.length > 0 && answeredCount === transactions.length
  const wholeAnswer = getWholeAnswer(suggestions, values)

  const openNextUnanswered = useCallback(() => {
    const next = form.state.values.rows.find(
      ({ answerKey, text }) => !resolveCounterpartyAskAnswer(suggestions, answerKey, text),
    )

    setOpenRowId(next?.transactionId ?? null)
  }, [form, suggestions])

  useEffect(() => {
    openNextUnanswered()
  }, [openNextUnanswered])

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
        {transactions.map((transaction, index) => (
          <CounterpartyAskTransactionRow
            key={transaction.id}
            form={form}
            index={index}
            transaction={transaction}
            suggestions={suggestions}
            isDisabled={isSubmitting}
            isOpen={openRowId === transaction.id}
            onOpen={() => setOpenRowId(transaction.id)}
            onAnswered={openNextUnanswered}
          />
        ))}
      </VStack>
      <HStack className='Layer__CounterpartyAskTask__Footer' align='center' justify='space-between' gap='sm' pi='md'>
        <Span size='xs' variant='subtle'>
          {isEveryRowAnswered
            ? t(
              'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.all_rows_answered',
              'All {{total}} answered',
              { total: transactions.length },
            )
            : t(
              'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.rows_answered',
              '{{answered}} of {{total}} answered',
              { answered: answeredCount, total: transactions.length },
            )}
        </Span>
        <Button isDisabled={!isEveryRowAnswered || isSubmitting} onPress={onSave}>
          {t('common:action.save_label', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}

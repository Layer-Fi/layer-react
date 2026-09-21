import { useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { withForm } from '@blocks/Form/useForm'
import {
  counterpartyAskFormOptions,
  getAnsweredRows,
  getWholeAnswer,
  resolveCounterpartyAskAnswer,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { CounterpartyAskTransactionRow } from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRow'

export const CounterpartyAskItemisedPane = withForm({
  ...counterpartyAskFormOptions,
  props: {
    transactions: [] as readonly MinimalBankTransaction[],
    suggestions: [] as readonly CounterpartyAskAccount[],
    /** Every row agreed on one answer, so the flow continues to the going-forward step instead of saving. */
    onUniformAnswer: () => {},
  },
  render: function Render({ form, transactions, suggestions, onUniformAnswer }) {
    const { t } = useTranslation()

    const findNextUnanswered = useCallback(() =>
      form.state.values.itemised.rows.find(
        ({ answerKey, text }) => !resolveCounterpartyAskAnswer(suggestions, answerKey, text),
      )?.transactionId ?? null, [form, suggestions])

    const [openRowId, setOpenRowId] = useState(findNextUnanswered)

    const values = useStore(form.store, state => state.values)
    const isSubmitting = useStore(form.store, state => state.isSubmitting)

    const { rows } = values.itemised
    const answeredCount = getAnsweredRows(suggestions, rows).length
    const isEveryRowAnswered = rows.length > 0 && answeredCount === rows.length

    const openNextUnanswered = useCallback(() => setOpenRowId(findNextUnanswered()), [findNextUnanswered])

    return (
      <form.FormGroup
        name='itemised'
        validators={{
          onDynamic: ({ value }) => (getAnsweredRows(suggestions, value.rows).length === value.rows.length
            ? undefined
            : {
              fields: {
                rows: t(
                  'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.validation.answer_every_row',
                  'Answer every transaction to continue',
                ),
              },
            }),
        }}
        onGroupSubmit={() => {
          if (getWholeAnswer(suggestions, form.state.values)) {
            onUniformAnswer()
            return
          }

          form.setFieldValue('remember.goingForward', null)
          void form.handleSubmit()
        }}
      >
        {formGroup => (
          <VStack gap='sm'>
            <P size='sm' pi='md'>
              {t(
                'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.prompt.answer_each_transaction',
                'Can you share more about what each transaction was for below?',
              )}
            </P>
            <VStack className='Layer__CounterpartyAskTask__Rows'>
              {rows.map(({ transactionId }, index) => {
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
            <HStack align='center' justify='space-between' gap='sm' pbs='xs' pbe='md' pi='md'>
              <Span size='xs' variant='subtle'>
                {isEveryRowAnswered
                  ? t(
                    'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.all_rows_answered',
                    'All {{total}} answered',
                    { total: rows.length },
                  )
                  : t(
                    'bookkeeping:TasksListItem.CounterpartyAskItemisedPane.label.rows_answered',
                    '{{answered}} of {{total}} answered',
                    { answered: answeredCount, total: rows.length },
                  )}
              </Span>
              <Button isDisabled={!isEveryRowAnswered || isSubmitting} onPress={() => void formGroup.handleSubmit()}>
                {t('common:action.save_label', 'Save')}
              </Button>
            </HStack>
          </VStack>
        )}
      </form.FormGroup>
    )
  },
})

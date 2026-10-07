import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type AskFormAnswer,
  type AskFormRowAnswer,
  type AskFormTransactionAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { UnifiedAskFormStep, type UnifiedAskFormStepProps } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStep'
import { UnifiedAskFormTransactionCells } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionCells'
import { findChosenOption, isRowAnswered } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'
import { useAskFormAnswerLabel } from '@features/bookkeeping/UnifiedAskForm/useAskFormAnswerLabel'

type UnifiedAskFormTransactionSheetProps = Omit<UnifiedAskFormStepProps, 'onPickOption' | 'depth'> & {
  transactions: ReadonlyArray<AskFormTransaction>
}

const toRowAnswer = (answer: AskFormAnswer): AskFormRowAnswer | undefined => {
  if ('choice' in answer) return answer
  if ('text' in answer) return answer
  return undefined
}

export const UnifiedAskFormTransactionSheet = (props: UnifiedAskFormTransactionSheetProps) => {
  const { step, prompt, answer, labels, onChange, transactions } = props
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const getAnswerLabel = useAskFormAnswerLabel(labels)

  const rows: ReadonlyArray<AskFormTransactionAnswer> = answer && 'transactionAnswers' in answer ? answer.transactionAnswers : []
  const getRowAnswer = (transactionId: string) => rows.find(row => row.transactionId === transactionId)?.answer
  const isAnswered = (transactionId: string) => isRowAnswered(step, getRowAnswer(transactionId))

  const [openId, setOpenId] = useState(() => transactions.find(({ id }) => !isAnswered(id))?.id ?? null)
  const answeredCount = transactions.filter(({ id }) => isAnswered(id)).length

  const setRow = (transactionId: string, next: AskFormAnswer) => {
    const rowAnswer = toRowAnswer(next)
    if (!rowAnswer) return

    const nextRows = transactions.flatMap(({ id }) => {
      if (id === transactionId) return [{ transactionId: id, answer: rowAnswer }]
      const existing = rows.find(row => row.transactionId === id)
      return existing ? [existing] : []
    })

    onChange({ transactionAnswers: nextRows })

    if (!findChosenOption(step, rowAnswer)?.followUp && isRowAnswered(step, rowAnswer)) {
      const nextOpen = transactions.find(({ id }) =>
        id !== transactionId && !isRowAnswered(step, nextRows.find(row => row.transactionId === id)?.answer))
      setOpenId(nextOpen?.id ?? null)
    }
  }

  return (
    <VStack gap='sm'>
      {prompt ? <P size='sm' pi='md'>{prompt}</P> : null}
      <VStack className='Layer__UnifiedAskForm__Rows' {...toDataProperties({ variant: 'sheet' })}>
        {transactions.map((transaction) => {
          const rowAnswer = getRowAnswer(transaction.id)
          const isOpen = openId === transaction.id
          const label = isAnswered(transaction.id) ? getAnswerLabel(step, rowAnswer) : null

          return (
            <VStack
              key={transaction.id}
              className='Layer__UnifiedAskForm__Row'
              {...toDataProperties({ open: isOpen })}
              pi='md'
            >
              <Button
                className='Layer__UnifiedAskForm__RowSummary'
                variant='text'
                underline={false}
                fullWidth
                onPress={() => setOpenId(transaction.id)}
              >
                <HStack align='center' gap='xs' overflow='hidden' fluid>
                  <UnifiedAskFormTransactionCells transaction={transaction} />
                  {label
                    ? <Span className='Layer__UnifiedAskForm__RowAnswer' size='sm' align='right' ellipsis noWrap>{label}</Span>
                    : null}
                </HStack>
              </Button>
              {isOpen
                ? (
                  <VStack pbe='sm' pbs='3xs'>
                    <UnifiedAskFormStep {...props} prompt={null} answer={rowAnswer} onChange={next => setRow(transaction.id, next)} />
                  </VStack>
                )
                : null}
            </VStack>
          )
        })}
      </VStack>
      <HStack justify='end' pi='md'>
        <Span size='xs' variant='subtle'>
          {t('bookkeeping:UnifiedAskForm.UnifiedAskFormTransactionSheet.label.categorized_count', '{{answered}} of {{total}} categorized', {
            answered: formatNumber(answeredCount),
            total: formatNumber(transactions.length),
          })}
        </Span>
      </HStack>
    </VStack>
  )
}

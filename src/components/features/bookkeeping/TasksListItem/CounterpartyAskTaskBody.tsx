import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskResponse } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import {
  buildAllSameCounterpartyAskResponse,
  buildItemisedCounterpartyAskResponse,
  collapseUniformCounterpartyAskAnswers,
  countDistinctCounterpartyAskAnswers,
  type CounterpartyAskAnswerValue,
  getCounterpartyAskAnswerLabel,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { BackButton } from '@ui/Button/BackButton'
import { Button } from '@ui/Button/Button'
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { TextArea } from '@ui/Input/TextArea'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { CounterpartyAskTaskSummary } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskSummary'
import {
  CounterpartyAskTransactionRow,
  OTHER_ANSWER_KEY,
  toSuggestionAnswerKey,
} from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRow'

import './counterpartyAskTaskBody.scss'

const MIX_ANSWER_KEY = 'mix'

type CounterpartyAskTaskBodyProps = {
  task: UserVisibleTask & CounterpartyAskTask
}

export const CounterpartyAskTaskBody = ({ task }: CounterpartyAskTaskBodyProps) => {
  const { t } = useTranslation()
  const { addToast, eventCallbacks } = useLayerContext()
  const { trigger: submitCounterpartyAskResponse, isMutating } = usePostCounterpartyAskResponse()

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [freeText, setFreeText] = useState('')
  const [rowKeys, setRowKeys] = useState<Record<string, string>>({})
  const [rowTexts, setRowTexts] = useState<Record<string, string>>({})
  const [isConfirming, setIsConfirming] = useState(false)
  const [sentAnswer, setSentAnswer] = useState<CounterpartyAskAnswerValue | null>(null)
  const [sentDistinctCount, setSentDistinctCount] = useState<number | null>(null)

  const { suggestions, transactions } = task
  const totalTransactions = transactions.length
  const isItemising = selectedKey === MIX_ANSWER_KEY
  const isFreeText = selectedKey === OTHER_ANSWER_KEY

  const resolveAnswer = useCallback(
    (answerKey: string | undefined, text: string): CounterpartyAskAnswerValue | null => {
      if (!answerKey) return null

      if (answerKey === OTHER_ANSWER_KEY) {
        const trimmed = text.trim()
        return trimmed ? { kind: 'text', text: trimmed } : null
      }

      const suggestion = suggestions.find((_, index) => toSuggestionAnswerKey(index) === answerKey)

      return suggestion ? { kind: 'account', account: suggestion } : null
    },
    [suggestions],
  )

  const answeredRows = useMemo(
    () =>
      transactions.flatMap((transaction) => {
        const answer = resolveAnswer(rowKeys[transaction.id], rowTexts[transaction.id] ?? '')

        return answer ? [{ transactionId: transaction.id, answer }] : []
      }),
    [transactions, rowKeys, rowTexts, resolveAnswer],
  )

  const isEveryRowAnswered = totalTransactions > 0 && answeredRows.length === totalTransactions

  const singleAnswer = isItemising
    ? (isEveryRowAnswered
      ? collapseUniformCounterpartyAskAnswers(answeredRows.map(row => row.answer))
      : null)
    : resolveAnswer(selectedKey ?? undefined, freeText)

  const canContinue = isItemising ? isEveryRowAnswered : singleAnswer !== null

  const submit = useCallback(
    async (response: CounterpartyAskResponse | null, wasCategorized: boolean, onSuccess: () => void) => {
      if (!response) return

      try {
        await submitCounterpartyAskResponse({ taskId: task.id, response })

        if (wasCategorized) {
          eventCallbacks?.onTransactionCategorized?.()
        }

        onSuccess()
      }
      catch {
        addToast({
          content: t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.error.submit_answer',
            'We couldn’t save that answer. Please try again.',
          ),
          type: 'error',
        })
      }
    },
    [addToast, eventCallbacks, submitCounterpartyAskResponse, t, task.id],
  )

  const onContinue = useCallback(() => {
    if (singleAnswer) {
      setIsConfirming(true)
      return
    }

    const wasCategorized = answeredRows.some(row => row.answer.kind === 'account')

    void submit(buildItemisedCounterpartyAskResponse(answeredRows), wasCategorized, () => {
      setSentDistinctCount(countDistinctCounterpartyAskAnswers(answeredRows.map(row => row.answer)))
    })
  }, [answeredRows, singleAnswer, submit])

  const onConfirm = useCallback(
    (alwaysThis: boolean) => {
      if (!singleAnswer) return

      void submit(buildAllSameCounterpartyAskResponse(singleAnswer, alwaysThis), singleAnswer.kind === 'account', () => {
        setSentAnswer(singleAnswer)
      })
    },
    [singleAnswer, submit],
  )

  if (sentAnswer) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answer_sent', 'Thanks — sent')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.receipt_all_same',
          'All {{total}} · {{answer}}',
          { total: totalTransactions, answer: getCounterpartyAskAnswerLabel(sentAnswer) },
        )}
        note={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.receipt_note_all_same',
          'We’ll use this for your books.',
        )}
      />
    )
  }

  if (sentDistinctCount !== null) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answer_sent', 'Thanks — sent')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.receipt_itemised',
          '{{total}} transactions · {{distinct}} different answers',
          { total: totalTransactions, distinct: sentDistinctCount },
        )}
        note={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.receipt_note_itemised',
          'Your bookkeeper takes it from here.',
        )}
      />
    )
  }

  if (task.resolvedByTaskId) {
    return (
      <CounterpartyAskTaskSummary
        title={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere',
          'Already answered',
        )}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere_detail',
          'You answered this for every period, so we’ve applied it here too.',
        )}
      />
    )
  }

  const storedAnswer: CounterpartyAskAnswerValue | null = task.responseAccount
    ? { kind: 'account', account: task.responseAccount }
    : (task.userResponse ? { kind: 'text', text: task.userResponse } : null)

  if (storedAnswer) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered', 'Answered')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.receipt_all_same',
          'All {{total}} · {{answer}}',
          { total: totalTransactions, answer: getCounterpartyAskAnswerLabel(storedAnswer) },
        )}
        note={task.alwaysThis
          ? t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_always',
            'We’ll use this every time from now on.',
          )
          : undefined}
      />
    )
  }

  const answeredTransactions = task.transactionResponses.filter(
    response => Boolean(response.userResponse) || Boolean(response.responseAccount),
  )

  if (answeredTransactions.length > 0) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered', 'Answered')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_itemised',
          'You answered {{answered}} of {{total}} individually.',
          { answered: answeredTransactions.length, total: totalTransactions },
        )}
      />
    )
  }

  if (isConfirming && singleAnswer) {
    const answerLabel = getCounterpartyAskAnswerLabel(singleAnswer)
    const counterpartyName = task.counterparty?.name

    return (
      <VStack gap='md' pb='sm'>
        <HStack>
          <BackButton onPress={() => setIsConfirming(false)} isDisabled={isMutating} />
        </HStack>
        <P weight='bold'>
          {counterpartyName
            ? t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.always_this_for_counterparty',
              'Will {{counterparty}} purchases always be {{answer}}?',
              { counterparty: counterpartyName, answer: answerLabel },
            )
            : t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.always_this',
              'Should we always use {{answer}} for these?',
              { answer: answerLabel },
            )}
        </P>
        <HStack gap='2xs'>
          <Button isDisabled={isMutating} onPress={() => onConfirm(true)}>
            {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.yes_always', 'Yes, always')}
          </Button>
          <Button variant='outlined' isDisabled={isMutating} onPress={() => onConfirm(false)}>
            {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.no_ask_again', 'No, ask me again')}
          </Button>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack gap='sm' pb='sm'>
      <P size='sm' variant='inherit'>{task.question}</P>
      <ChipGroup
        ariaLabel={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answer',
          'What these were for',
        )}
        value={selectedKey}
        onChange={setSelectedKey}
        wrap
      >
        {suggestions.map((suggestion, index) => (
          <Chip key={toSuggestionAnswerKey(index)} value={toSuggestionAnswerKey(index)}>
            {suggestion.name}
          </Chip>
        ))}
        <Chip value={OTHER_ANSWER_KEY}>
          {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.something_else', 'Something else')}
        </Chip>
        {totalTransactions > 1
          ? (
            <HStack className='Layer__CounterpartyAskTask__MixRow' justify='center'>
              <Chip value={MIX_ANSWER_KEY}>
                {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.a_mix_of_the_above', 'A mix of the above')}
              </Chip>
            </HStack>
          )
          : null}
      </ChipGroup>
      {isFreeText
        ? (
          <VStack className='Layer__CounterpartyAskTask__FreeText'>
            <TextArea
              value={freeText}
              placeholder={t(
                'bookkeeping:TasksListItem.CounterpartyAskTaskBody.placeholder.what_were_these_for',
                'What were these purchases for?',
              )}
              onChange={event => setFreeText(event.target.value)}
            />
          </VStack>
        )
        : null}
      {isItemising
        ? (
          <VStack gap='2xs'>
            <VStack className='Layer__CounterpartyAskTask__Rows'>
              {transactions.map(transaction => (
                <CounterpartyAskTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  suggestions={suggestions}
                  selectedKey={rowKeys[transaction.id] ?? null}
                  text={rowTexts[transaction.id] ?? ''}
                  onSelect={answerKey =>
                    setRowKeys(current => ({ ...current, [transaction.id]: answerKey }))}
                  onChangeText={text =>
                    setRowTexts(current => ({ ...current, [transaction.id]: text }))}
                />
              ))}
            </VStack>
            <Span size='xs' variant='subtle'>
              {isEveryRowAnswered
                ? t(
                  'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.all_rows_answered',
                  'All {{total}} answered',
                  { total: totalTransactions },
                )
                : t(
                  'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.rows_answered',
                  '{{answered}} of {{total}} answered',
                  { answered: answeredRows.length, total: totalTransactions },
                )}
            </Span>
          </VStack>
        )
        : null}
      <HStack justify='end'>
        <Button isDisabled={!canContinue || isMutating} onPress={onContinue}>
          {t('common:action.continue_label', 'Continue')}
        </Button>
      </HStack>
    </VStack>
  )
}

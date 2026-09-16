import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskResponse } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import {
  buildAllSameCounterpartyAskResponse,
  buildItemisedCounterpartyAskResponse,
  collapseUniformCounterpartyAskAnswers,
  type CounterpartyAskAnswerValue,
  getCounterpartyAskAnswerLabel,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { Button } from '@ui/Button/Button'
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { TextArea } from '@ui/Input/TextArea'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
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

type AskView = 'picker' | 'freeText' | 'itemised' | 'remember'

export type CounterpartyAskBackAction = {
  isDisabled: boolean
  onBack: () => void
}

type CounterpartyAskTaskBodyProps = {
  task: UserVisibleTask & CounterpartyAskTask
  counterpartyName: string
  onAnsweredLabelChange: (label: string | null) => void
  onBackActionChange: (backAction: CounterpartyAskBackAction | null) => void
}

export const CounterpartyAskTaskBody = ({
  task,
  counterpartyName,
  onAnsweredLabelChange,
  onBackActionChange,
}: CounterpartyAskTaskBodyProps) => {
  const { t } = useTranslation()
  const { addToast, eventCallbacks } = useLayerContext()
  const { trigger: submitCounterpartyAskResponse, isMutating } = usePostCounterpartyAskResponse()

  const [view, setView] = useState<AskView>('picker')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [freeText, setFreeText] = useState('')
  const [rowKeys, setRowKeys] = useState<Record<string, string>>({})
  const [rowTexts, setRowTexts] = useState<Record<string, string>>({})
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [paneHeight, setPaneHeight] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const paneObserver = useRef<ResizeObserver | null>(null)

  const measurePane = useCallback((pane: HTMLDivElement | null) => {
    paneObserver.current?.disconnect()

    if (!pane) return

    const observer = new ResizeObserver(() => setPaneHeight(pane.offsetHeight))
    observer.observe(pane)
    paneObserver.current = observer
  }, [])

  const goForward = useCallback((nextView: AskView) => {
    setDirection('forward')
    setView(nextView)
  }, [])

  const { suggestions, transactions } = task
  const totalTransactions = transactions.length
  const isAnswered = task.status !== BusinessTaskStatus.Todo

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

  const pickerAnswer = selectedKey === MIX_ANSWER_KEY
    ? (isEveryRowAnswered
      ? collapseUniformCounterpartyAskAnswers(answeredRows.map(row => row.answer))
      : null)
    : resolveAnswer(selectedKey ?? undefined, freeText)

  const openNextUnanswered = useCallback(
    (nextRowKeys: Record<string, string>, nextRowTexts: Record<string, string>) => {
      const next = transactions.find(
        transaction => !resolveAnswer(nextRowKeys[transaction.id], nextRowTexts[transaction.id] ?? ''),
      )

      setOpenRowId(next?.id ?? null)
    },
    [transactions, resolveAnswer],
  )

  const submit = useCallback(
    async (response: CounterpartyAskResponse | null, wasCategorized: boolean, answerLabel: string | null) => {
      if (!response) return

      try {
        await submitCounterpartyAskResponse({ taskId: task.id, response })

        if (wasCategorized) {
          eventCallbacks?.onTransactionCategorized?.()
        }

        onAnsweredLabelChange(answerLabel)
        setIsEditing(false)
        setView('picker')
        setSelectedKey(null)
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
    [addToast, eventCallbacks, onAnsweredLabelChange, submitCounterpartyAskResponse, t, task.id],
  )

  const onPick = useCallback((key: string) => {
    if (key === MIX_ANSWER_KEY) {
      setSelectedKey(key)
      goForward('itemised')
      openNextUnanswered(rowKeys, rowTexts)
      return
    }

    setSelectedKey(key)
    goForward(key === OTHER_ANSWER_KEY ? 'freeText' : 'remember')
  }, [goForward, openNextUnanswered, rowKeys, rowTexts])

  const onSaveItemised = useCallback(() => {
    if (pickerAnswer) {
      goForward('remember')
      return
    }

    void submit(
      buildItemisedCounterpartyAskResponse(answeredRows),
      answeredRows.every(row => row.answer.kind === 'account'),
      t(
        'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_individually',
        'Answered individually',
      ),
    )
  }, [answeredRows, goForward, pickerAnswer, submit, t])

  const onAnswerRemember = useCallback((alwaysThis: boolean) => {
    if (!pickerAnswer) return

    void submit(
      buildAllSameCounterpartyAskResponse(pickerAnswer, alwaysThis),
      pickerAnswer.kind === 'account',
      getCounterpartyAskAnswerLabel(pickerAnswer),
    )
  }, [pickerAnswer, submit])

  const goBack = useCallback(() => {
    setDirection('back')

    if (view === 'remember' && selectedKey === MIX_ANSWER_KEY) {
      setView('itemised')
      return
    }

    if (view === 'picker') {
      setIsEditing(false)
      return
    }

    setSelectedKey(null)
    setView('picker')
  }, [selectedKey, view])

  const hasBackAction = isEditing || (!isAnswered && view !== 'picker')

  useEffect(() => {
    onBackActionChange(hasBackAction ? { isDisabled: isMutating, onBack: goBack } : null)

    return () => onBackActionChange(null)
  }, [goBack, hasBackAction, isMutating, onBackActionChange])

  const startEditing = useCallback(() => {
    const seededRowKeys: Record<string, string> = {}
    const seededRowTexts: Record<string, string> = {}

    task.transactionResponses.forEach(({ transactionId, responseAccount, userResponse }) => {
      if (responseAccount) {
        const index = suggestions.findIndex(suggestion =>
          AccountIdentifierEquivalence(suggestion.accountIdentifier, responseAccount.accountIdentifier),
        )

        if (index >= 0) seededRowKeys[transactionId] = toSuggestionAnswerKey(index)
        return
      }

      if (userResponse) {
        seededRowKeys[transactionId] = OTHER_ANSWER_KEY
        seededRowTexts[transactionId] = userResponse
      }
    })

    setRowKeys(seededRowKeys)
    setRowTexts(seededRowTexts)
    setFreeText(task.userResponse ?? '')
    setSelectedKey(null)
    setDirection('forward')
    setView('picker')
    setIsEditing(true)
  }, [suggestions, task.transactionResponses, task.userResponse])

  const storedAnswer: CounterpartyAskAnswerValue | null = task.responseAccount
    ? { kind: 'account', account: task.responseAccount }
    : (task.userResponse ? { kind: 'text', text: task.userResponse } : null)

  const answeredTransactions = task.transactionResponses.filter(
    response => Boolean(response.userResponse) || Boolean(response.responseAccount),
  )

  if (isAnswered && !isEditing && task.resolvedByTaskId) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere', 'Already answered')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere_detail',
          'You answered this for every period, so we’ve applied it here too.',
        )}
      />
    )
  }

  if (isAnswered && !isEditing && storedAnswer) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered', 'Answered')}
        detail={getCounterpartyAskAnswerLabel(storedAnswer)}
        note={task.alwaysThis
          ? t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_always',
            'We’ll use this every time from now on.',
          )
          : undefined}
        onEdit={startEditing}
      />
    )
  }

  if (isAnswered && !isEditing && answeredTransactions.length > 0) {
    return (
      <CounterpartyAskTaskSummary
        title={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered', 'Answered')}
        detail={t(
          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_itemised',
          'You answered {{answered}} of {{total}} individually.',
          { answered: answeredTransactions.length, total: totalTransactions },
        )}
        onEdit={startEditing}
      />
    )
  }

  const renderPane = () => {
    if (view === 'remember' && pickerAnswer) {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm'>
            {t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.assume_going_forward',
              'Should we assume your future {{counterparty}} purchases are {{answer}} going forward?',
              {
                counterparty: counterpartyName,
                answer: getCounterpartyAskAnswerLabel(pickerAnswer),
              },
            )}
          </P>
          <ChipGroup
            ariaLabel={t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.assume_going_forward',
              'Whether to assume this going forward',
            )}
            value={null}
            onChange={key => onAnswerRemember(key === 'always')}
            isDisabled={isMutating}
            wrap
          >
            <Chip size='lg' value='always'>
              {t(
                'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.yes_categorize_automatically',
                'Yes, automatically categorize them',
              )}
            </Chip>
            <Chip size='lg' value='ask'>
              {t(
                'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.no_keep_asking',
                'No, keep asking me about them',
              )}
            </Chip>
          </ChipGroup>
          {isMutating
            ? (
              <HStack align='center' gap='xs'>
                <LoadingSpinner size={14} />
                <Span size='xs' variant='subtle'>{t('common:state.saving', 'Saving...')}</Span>
              </HStack>
            )
            : null}
        </VStack>
      )
    }

    if (view === 'freeText') {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm'>
            {t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.what_were_these_for',
              'What were these purchases for?',
            )}
          </P>
          <VStack className='Layer__CounterpartyAskTask__FreeText'>
            <TextArea
              value={freeText}
              placeholder={t(
                'bookkeeping:TasksListItem.CounterpartyAskTaskBody.placeholder.own_words',
                'Tell us in your own words',
              )}
              onChange={event => setFreeText(event.target.value)}
            />
          </VStack>
          <HStack justify='end'>
            <Button isDisabled={!freeText.trim()} onPress={() => goForward('remember')}>
              {t('common:action.save_label', 'Save')}
            </Button>
          </HStack>
        </VStack>
      )
    }

    if (view === 'itemised') {
      return (
        <VStack gap='sm'>
          <P size='sm' pi='md'>
            {t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.answer_each_transaction',
              'Can you share more about what each transaction was for below?',
            )}
          </P>
          <VStack className='Layer__CounterpartyAskTask__Rows'>
            {transactions.map((transaction) => {
              const answer = resolveAnswer(rowKeys[transaction.id], rowTexts[transaction.id] ?? '')

              return (
                <CounterpartyAskTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  suggestions={suggestions}
                  selectedKey={rowKeys[transaction.id] ?? null}
                  text={rowTexts[transaction.id] ?? ''}
                  answerLabel={answer ? getCounterpartyAskAnswerLabel(answer) : null}
                  isDisabled={isMutating}
                  isOpen={openRowId === transaction.id}
                  onOpen={() => setOpenRowId(transaction.id)}
                  onSelect={(answerKey) => {
                    const nextRowKeys = { ...rowKeys, [transaction.id]: answerKey }
                    setRowKeys(nextRowKeys)

                    if (answerKey !== OTHER_ANSWER_KEY) openNextUnanswered(nextRowKeys, rowTexts)
                  }}
                  onChangeText={text => setRowTexts(current => ({ ...current, [transaction.id]: text }))}
                  onCommitText={() => openNextUnanswered(rowKeys, rowTexts)}
                />
              )
            })}
          </VStack>
          <HStack
            className='Layer__CounterpartyAskTask__Footer'
            align='center'
            justify='space-between'
            gap='sm'
            pi='md'
          >
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
            <Button isDisabled={!isEveryRowAnswered || isMutating} onPress={onSaveItemised}>
              {t('common:action.save_label', 'Save')}
            </Button>
          </HStack>
        </VStack>
      )
    }

    return (
      <VStack gap='sm' pb='md' pi='md'>
        <P size='sm'>{task.question}</P>
        <ChipGroup
          ariaLabel={t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answer',
            'What these were for',
          )}
          value={selectedKey}
          onChange={onPick}
          wrap
        >
          {suggestions.map((suggestion, index) => (
            <Chip key={toSuggestionAnswerKey(index)} size='lg' value={toSuggestionAnswerKey(index)}>
              {suggestion.name}
            </Chip>
          ))}
          <Chip size='lg' value={OTHER_ANSWER_KEY}>
            {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.something_else', 'Something else')}
            <ChevronRight size={15} />
          </Chip>
          {totalTransactions > 1
            ? (
              <Chip size='lg' value={MIX_ANSWER_KEY}>
                {t(
                  'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.multiple_different_things',
                  'Multiple different things',
                )}
                <ChevronRight size={15} />
              </Chip>
            )
            : null}
        </ChipGroup>
      </VStack>
    )
  }

  return (
    <div
      className='Layer__CounterpartyAskTask'
      style={paneHeight === null ? undefined : { blockSize: paneHeight }}
    >
      <div
        key={view}
        ref={measurePane}
        className='Layer__CounterpartyAskTask__Pane'
        data-direction={direction}
      >
        {renderPane()}
      </div>
    </div>
  )
}

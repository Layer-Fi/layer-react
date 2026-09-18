import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
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
import {
  CounterpartyAskTransactionRow,
  OTHER_ANSWER_KEY,
  toSuggestionAnswerKey,
} from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRow'

import './counterpartyAskTaskBody.scss'

const MIX_ANSWER_KEY = 'mix'

type AskView = 'picker' | 'freeText' | 'itemised' | 'remember'
type PaneDirection = 'forward' | 'back'

const PANE_TRANSITION = { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const }

const paneVariants = {
  enter: (direction: PaneDirection) => ({ x: direction === 'forward' ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: PaneDirection) => ({ x: direction === 'forward' ? '-100%' : '100%' }),
}

const seedRowAnswers = ({ suggestions, transactionResponses }: CounterpartyAskTask) => {
  const rowKeys: Record<string, string> = {}
  const rowTexts: Record<string, string> = {}

  transactionResponses.forEach(({ transactionId, responseAccount, userResponse }) => {
    if (responseAccount) {
      const index = suggestions.findIndex(suggestion =>
        AccountIdentifierEquivalence(suggestion.accountIdentifier, responseAccount.accountIdentifier),
      )

      if (index >= 0) rowKeys[transactionId] = toSuggestionAnswerKey(index)
      return
    }

    if (userResponse) {
      rowKeys[transactionId] = OTHER_ANSWER_KEY
      rowTexts[transactionId] = userResponse
    }
  })

  return { rowKeys, rowTexts }
}

const seedSelectedKey = (task: CounterpartyAskTask) => {
  if (task.responseAccount) {
    const { accountIdentifier } = task.responseAccount
    const index = task.suggestions.findIndex(suggestion =>
      AccountIdentifierEquivalence(suggestion.accountIdentifier, accountIdentifier),
    )

    return index >= 0 ? toSuggestionAnswerKey(index) : null
  }

  if (task.userResponse) return OTHER_ANSWER_KEY

  const hasRowAnswers = task.transactionResponses.some(
    ({ responseAccount, userResponse }) => responseAccount || userResponse,
  )

  return hasRowAnswers ? MIX_ANSWER_KEY : null
}

export type CounterpartyAskBackAction = {
  isDisabled: boolean
  onBack: () => void
}

type CounterpartyAskTaskBodyProps = {
  task: UserVisibleTask & CounterpartyAskTask
  counterpartyName: string
  onAnsweredLabelChange: (label: string | null) => void
  onAnswered: () => void
  onBackActionChange: (backAction: CounterpartyAskBackAction | null) => void
}

export const CounterpartyAskTaskBody = ({
  task,
  counterpartyName,
  onAnsweredLabelChange,
  onAnswered,
  onBackActionChange,
}: CounterpartyAskTaskBodyProps) => {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const { addToast, eventCallbacks } = useLayerContext()
  const { trigger: submitCounterpartyAskResponse, isMutating } = usePostCounterpartyAskResponse()

  const [view, setView] = useState<AskView>('picker')
  const [selectedKey, setSelectedKey] = useState<string | null>(() => seedSelectedKey(task))
  const [freeText, setFreeText] = useState(() => task.userResponse ?? '')
  const [rowKeys, setRowKeys] = useState(() => seedRowAnswers(task).rowKeys)
  const [rowTexts, setRowTexts] = useState(() => seedRowAnswers(task).rowTexts)
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [direction, setDirection] = useState<PaneDirection>('forward')
  const [paneNode, setPaneNode] = useState<HTMLDivElement | null>(null)
  const [paneHeight, setPaneHeight] = useState<number | null>(null)

  // An exiting pane detaches its ref after the next pane attached; ignore the null.
  const measurePane = useCallback((node: HTMLDivElement | null) => {
    if (node) setPaneNode(node)
  }, [])

  useEffect(() => {
    if (!paneNode) return

    const observer = new ResizeObserver(() => setPaneHeight(paneNode.offsetHeight))
    observer.observe(paneNode)

    return () => observer.disconnect()
  }, [paneNode])

  const paneTransition = shouldReduceMotion ? { duration: 0 } : PANE_TRANSITION

  const goForward = useCallback((nextView: AskView) => {
    setDirection('forward')
    setView(nextView)
  }, [])

  const { suggestions, transactions } = task
  const totalTransactions = transactions.length

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
        setDirection('back')
        setView('picker')
        onAnswered()
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
    [addToast, eventCallbacks, onAnswered, onAnsweredLabelChange, submitCounterpartyAskResponse, t, task.id],
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

  const hadAccountAnswer = Boolean(task.responseAccount)
    || task.transactionResponses.some(response => Boolean(response.responseAccount))

  const onSaveItemised = useCallback(() => {
    if (pickerAnswer) {
      goForward('remember')
      return
    }

    void submit(
      buildItemisedCounterpartyAskResponse(answeredRows),
      answeredRows.every(row => row.answer.kind === 'account') || hadAccountAnswer,
      t(
        'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_individually',
        'Answered individually',
      ),
    )
  }, [answeredRows, goForward, hadAccountAnswer, pickerAnswer, submit, t])

  const onAnswerRemember = useCallback((alwaysThis: boolean) => {
    if (!pickerAnswer) return

    void submit(
      buildAllSameCounterpartyAskResponse(pickerAnswer, alwaysThis),
      pickerAnswer.kind === 'account' || hadAccountAnswer,
      pickerAnswer.kind === 'account'
        ? pickerAnswer.account.name
        : t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.custom_response', 'Custom response'),
    )
  }, [hadAccountAnswer, pickerAnswer, submit, t])

  const goBack = useCallback(() => {
    setDirection('back')

    if (view === 'remember' && selectedKey === MIX_ANSWER_KEY) {
      setView('itemised')
      return
    }

    setView('picker')
  }, [selectedKey, view])

  const hasBackAction = view !== 'picker'

  useEffect(() => {
    onBackActionChange(hasBackAction ? { isDisabled: isMutating, onBack: goBack } : null)

    return () => onBackActionChange(null)
  }, [goBack, hasBackAction, isMutating, onBackActionChange])

  if (task.resolvedByTaskId) {
    return (
      <VStack pb='md' pi='md'>
        <P size='sm' variant='subtle'>
          {t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_elsewhere_detail',
            'You answered this for every period, so we’ve applied it here too.',
          )}
        </P>
      </VStack>
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
        >
          {suggestions.map((suggestion, index) => (
            <Chip
              key={toSuggestionAnswerKey(index)}
              size='lg'
              value={toSuggestionAnswerKey(index)}
              onReselect={() => onPick(toSuggestionAnswerKey(index))}
            >
              {suggestion.name}
            </Chip>
          ))}
          <Chip size='lg' value={OTHER_ANSWER_KEY} onReselect={() => onPick(OTHER_ANSWER_KEY)}>
            {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.something_else', 'Something else')}
            <ChevronRight size={15} />
          </Chip>
          {totalTransactions > 1
            ? (
              <Chip size='lg' value={MIX_ANSWER_KEY} onReselect={() => onPick(MIX_ANSWER_KEY)}>
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
    <motion.div
      className='Layer__CounterpartyAskTask'
      initial={false}
      animate={paneHeight === null ? undefined : { height: paneHeight }}
      transition={paneTransition}
    >
      <AnimatePresence initial={false} mode='popLayout' custom={direction}>
        <motion.div
          key={view}
          ref={measurePane}
          custom={direction}
          variants={paneVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={paneTransition}
        >
          {renderPane()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

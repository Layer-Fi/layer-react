import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { getCounterpartyAskAnswerLabel } from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import {
  getAnsweredRows,
  getWholeAnswer,
  MIX_ANSWER_KEY,
  OTHER_ANSWER_KEY,
  resolveCounterpartyAskAnswer,
  toSuggestionAnswerKey,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { CounterpartyAskTransactionRow } from '@features/bookkeeping/TasksListItem/CounterpartyAskTransactionRow'
import {
  type CounterpartyAskSaved,
  useCounterpartyAskForm,
} from '@features/bookkeeping/TasksListItem/useCounterpartyAskForm'

import './counterpartyAskTaskBody.scss'

type AskView = 'picker' | 'freeText' | 'itemised' | 'remember'
type PaneDirection = 'forward' | 'back'

const PANE_TRANSITION = { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const }

const paneVariants = {
  enter: (direction: PaneDirection) => ({ x: direction === 'forward' ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: PaneDirection) => ({ x: direction === 'forward' ? '-100%' : '100%' }),
}

export type CounterpartyAskBackAction = {
  isDisabled: boolean
  onBack: () => void
}

type CounterpartyAskTaskBodyProps = {
  task: UserVisibleTask & CounterpartyAskTask
  counterpartyName: string
  isExpanded: boolean
  onAnsweredLabelChange: (label: string | null) => void
  onAnswered: () => void
  onBackActionChange: (backAction: CounterpartyAskBackAction | null) => void
}

export const CounterpartyAskTaskBody = ({
  task,
  counterpartyName,
  isExpanded,
  onAnsweredLabelChange,
  onAnswered,
  onBackActionChange,
}: CounterpartyAskTaskBodyProps) => {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const { eventCallbacks } = useLayerContext()

  const [view, setView] = useState<AskView>('picker')
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [direction, setDirection] = useState<PaneDirection>('forward')
  const [paneNode, setPaneNode] = useState<HTMLDivElement | null>(null)
  const [paneHeight, setPaneHeight] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onSaved = useCallback(({ answerLabel, wasCategorized }: CounterpartyAskSaved) => {
    if (wasCategorized) {
      eventCallbacks?.onTransactionCategorized?.()
    }

    onAnsweredLabelChange(answerLabel)
    setDirection('back')
    setView('picker')
    onAnswered()
  }, [eventCallbacks, onAnswered, onAnsweredLabelChange])

  const { form } = useCounterpartyAskForm({ task, onSaved })
  const values = useStore(form.store, state => state.values)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

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

  const keepInView = useCallback(() => {
    if (!isExpanded) return

    containerRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    })
  }, [isExpanded, shouldReduceMotion])

  const goForward = useCallback((nextView: AskView) => {
    setDirection('forward')
    setView(nextView)
  }, [])

  const { suggestions, transactions } = task
  const totalTransactions = transactions.length

  const answeredRows = useMemo(() => getAnsweredRows(suggestions, values.rows), [suggestions, values.rows])
  const isEveryRowAnswered = totalTransactions > 0 && answeredRows.length === totalTransactions
  const wholeAnswer = useMemo(() => getWholeAnswer(suggestions, values), [suggestions, values])

  const openNextUnanswered = useCallback(() => {
    const next = form.state.values.rows.find(
      ({ answerKey, text }) => !resolveCounterpartyAskAnswer(suggestions, answerKey, text),
    )

    setOpenRowId(next?.transactionId ?? null)
  }, [form, suggestions])

  const onPick = useCallback((key: string) => {
    if (key === MIX_ANSWER_KEY) {
      goForward('itemised')
      openNextUnanswered()
      return
    }

    goForward(key === OTHER_ANSWER_KEY ? 'freeText' : 'remember')
  }, [goForward, openNextUnanswered])

  const onSaveItemised = useCallback(() => {
    if (wholeAnswer) {
      goForward('remember')
      return
    }

    form.setFieldValue('goingForward', null)
    void form.handleSubmit()
  }, [form, goForward, wholeAnswer])

  const goBack = useCallback(() => {
    setDirection('back')

    if (view === 'remember' && values.answerKey === MIX_ANSWER_KEY) {
      setView('itemised')
      return
    }

    setView('picker')
  }, [values.answerKey, view])

  const hasBackAction = view !== 'picker'

  useEffect(() => {
    onBackActionChange(hasBackAction ? { isDisabled: isSubmitting, onBack: goBack } : null)

    return () => onBackActionChange(null)
  }, [goBack, hasBackAction, isSubmitting, onBackActionChange])

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
    if (view === 'remember' && wholeAnswer) {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm'>
            {t(
              'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.assume_going_forward',
              'Should we assume your future {{counterparty}} purchases are {{answer}} going forward?',
              {
                counterparty: counterpartyName,
                answer: getCounterpartyAskAnswerLabel(wholeAnswer),
              },
            )}
          </P>
          <form.AppField name='goingForward'>
            {field => (
              <field.FormChipGroupField
                label={t(
                  'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.assume_going_forward',
                  'Whether to assume this going forward',
                )}
                showLabel={false}
                size='lg'
                isDisabled={isSubmitting}
                options={[
                  {
                    value: 'always',
                    label: t(
                      'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.yes_categorize_automatically',
                      'Yes, automatically categorize them',
                    ),
                  },
                  {
                    value: 'ask',
                    label: t(
                      'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.no_keep_asking',
                      'No, keep asking me about them',
                    ),
                  },
                ]}
                onSelect={() => void form.handleSubmit()}
              />
            )}
          </form.AppField>
          {isSubmitting
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
            <form.AppField name='freeText'>
              {field => (
                <field.FormTextAreaField
                  label={t(
                    'bookkeeping:TasksListItem.CounterpartyAskTaskBody.prompt.what_were_these_for',
                    'What were these purchases for?',
                  )}
                  showLabel={false}
                  placeholder={t(
                    'bookkeeping:TasksListItem.CounterpartyAskTaskBody.placeholder.own_words',
                    'Tell us in your own words',
                  )}
                />
              )}
            </form.AppField>
          </VStack>
          <HStack justify='end'>
            <Button isDisabled={!values.freeText.trim()} onPress={() => goForward('remember')}>
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
            {transactions.map((transaction, index) => {
              const row = values.rows[index]
              const answerKey = row?.answerKey ?? null
              const text = row?.text ?? ''
              const answer = resolveCounterpartyAskAnswer(suggestions, answerKey, text)

              return (
                <CounterpartyAskTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  suggestions={suggestions}
                  selectedKey={answerKey}
                  text={text}
                  answerLabel={answer ? getCounterpartyAskAnswerLabel(answer) : null}
                  isDisabled={isSubmitting}
                  isOpen={openRowId === transaction.id}
                  onOpen={() => setOpenRowId(transaction.id)}
                  onSelect={(nextKey) => {
                    form.setFieldValue(`rows[${index}].answerKey`, nextKey)

                    if (nextKey !== OTHER_ANSWER_KEY) openNextUnanswered()
                  }}
                  onChangeText={nextText => form.setFieldValue(`rows[${index}].text`, nextText)}
                  onCommitText={openNextUnanswered}
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
            <Button isDisabled={!isEveryRowAnswered || isSubmitting} onPress={onSaveItemised}>
              {t('common:action.save_label', 'Save')}
            </Button>
          </HStack>
        </VStack>
      )
    }

    const chevron = <ChevronRight size={15} />

    return (
      <VStack gap='sm' pb='md' pi='md'>
        <P size='sm'>{task.question}</P>
        <form.AppField name='answerKey'>
          {field => (
            <field.FormChipGroupField
              label={t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answer', 'What these were for')}
              showLabel={false}
              size='lg'
              options={[
                ...suggestions.map((suggestion, index) => ({
                  value: toSuggestionAnswerKey(index),
                  label: suggestion.name,
                })),
                {
                  value: OTHER_ANSWER_KEY,
                  label: (
                    <>
                      {t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.something_else', 'Something else')}
                      {chevron}
                    </>
                  ),
                },
                ...(totalTransactions > 1
                  ? [{
                    value: MIX_ANSWER_KEY,
                    label: (
                      <>
                        {t(
                          'bookkeeping:TasksListItem.CounterpartyAskTaskBody.action.multiple_different_things',
                          'Multiple different things',
                        )}
                        {chevron}
                      </>
                    ),
                  }]
                  : []),
              ]}
              onSelect={onPick}
            />
          )}
        </form.AppField>
      </VStack>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className='Layer__CounterpartyAskTask'
      initial={false}
      animate={paneHeight === null ? undefined : { height: paneHeight }}
      transition={paneTransition}
      onAnimationComplete={keepInView}
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

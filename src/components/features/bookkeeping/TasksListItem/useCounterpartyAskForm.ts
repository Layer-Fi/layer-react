import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  buildAllSameCounterpartyAskResponse,
  buildItemisedCounterpartyAskResponse,
} from '@utils/features/bookkeeping/counterpartyAskAnswers'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { useAppForm } from '@blocks/Form/useForm'
import {
  type CounterpartyAskFormValues,
  getAnsweredRows,
  getCounterpartyAskFormDefaultValues,
  getWholeAnswer,
  MIX_ANSWER_KEY,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

export type CounterpartyAskSaved = {
  task: CounterpartyAskTask
  answerLabel: string
  wasCategorized: boolean
}

type UseCounterpartyAskFormProps = {
  task: CounterpartyAskTask
  onSaved: (saved: CounterpartyAskSaved) => void
}

export const useCounterpartyAskForm = ({ task, onSaved }: UseCounterpartyAskFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger: submitCounterpartyAskResponse } = usePostCounterpartyAskResponse()

  const { suggestions } = task
  const hadAccountAnswer = Boolean(task.responseAccount)
    || task.transactionResponses.some(({ responseAccount }) => Boolean(responseAccount))

  const form = useAppForm<CounterpartyAskFormValues>({
    defaultValues: getCounterpartyAskFormDefaultValues(task),
    onSubmit: async ({ value }) => {
      const answeredRows = getAnsweredRows(suggestions, value.rows)
      const wholeAnswer = getWholeAnswer(suggestions, value)
      const isItemised = value.answerKey === MIX_ANSWER_KEY && value.goingForward === null

      const submission = isItemised
        ? {
          response: buildItemisedCounterpartyAskResponse(answeredRows),
          wasCategorized: answeredRows.every(({ answer }) => answer.kind === 'account'),
          answerLabel: t(
            'bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_individually',
            'Several categories',
          ),
        }
        : wholeAnswer && {
          response: buildAllSameCounterpartyAskResponse(wholeAnswer, value.goingForward === 'always'),
          wasCategorized: wholeAnswer.kind === 'account',
          answerLabel: wholeAnswer.kind === 'account'
            ? wholeAnswer.account.name
            : t('bookkeeping:TasksListItem.CounterpartyAskTaskBody.label.answered_in_own_words', 'Answered in your words'),
        }

      if (!submission?.response) return

      try {
        const saved = await submitCounterpartyAskResponse({ taskId: task.id, response: submission.response })

        form.reset(getCounterpartyAskFormDefaultValues(saved))
        onSaved({
          task: saved,
          answerLabel: submission.answerLabel,
          wasCategorized: submission.wasCategorized || hadAccountAnswer,
        })
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
  })

  return useMemo(() => ({ form }), [form])
}

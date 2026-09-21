import { useEffect, useMemo } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { useRawAppForm } from '@blocks/Form/useForm'
import {
  buildCounterpartyAskSubmission,
  counterpartyAskFormOptions,
  type CounterpartyAskSubmission,
  getCounterpartyAskFormDefaultValues,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

export type CounterpartyAskSaved = Pick<CounterpartyAskSubmission, 'answer' | 'wasCategorized'>

type UseCounterpartyAskFormProps = {
  task: CounterpartyAskTask
  onSaved: (saved: CounterpartyAskSaved) => void
}

export const useCounterpartyAskForm = ({ task, onSaved }: UseCounterpartyAskFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger: submitCounterpartyAskResponse } = usePostCounterpartyAskResponse()

  // The raw hook infers the same validator generics as the `withForm` panes; the wrapper pins them.
  const form = useRawAppForm({
    ...counterpartyAskFormOptions,
    defaultValues: getCounterpartyAskFormDefaultValues(task),
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const submission = buildCounterpartyAskSubmission(task, value)

      if (!submission) return

      try {
        const saved = await submitCounterpartyAskResponse({ taskId: task.id, response: submission.response })

        form.reset(getCounterpartyAskFormDefaultValues(saved))
        onSaved(submission)
      }
      catch {
        addToast({
          content: t(
            'bookkeeping:TasksListItem.useCounterpartyAskForm.error.submit_answer',
            'We couldn’t save that answer. Please try again.',
          ),
          type: 'error',
        })
      }
    },
  })

  // A refetch that links or unlinks transactions invalidates the row set; the API rejects an
  // itemised response that skips a linked transaction, so start the rows over from the task.
  const linkedIds = task.transactions.map(({ id }) => id).join(',')

  useEffect(() => {
    const rowIds = form.state.values.itemised.rows.map(({ transactionId }) => transactionId).join(',')

    if (rowIds !== linkedIds) form.reset(getCounterpartyAskFormDefaultValues(task))
  }, [form, linkedIds, task])

  return useMemo(() => ({ form }), [form])
}

export type CounterpartyAskForm = ReturnType<typeof useCounterpartyAskForm>['form']

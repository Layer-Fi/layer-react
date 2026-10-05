import { useEffect, useMemo } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AnyCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTask'
import { tConditional } from '@utils/shared/i18n/conditional'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { useRawAppForm } from '@blocks/Form/useForm'
import {
  buildCounterpartyAskSubmission,
  type CounterpartyAskCounterparty,
  counterpartyAskFormOptions,
  type CounterpartyAskSubmission,
  getCounterpartyAskCounterparty,
  getCounterpartyAskFormDefaultValues,
} from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

type AlwaysAskConfirmationCondition = 'p2p' | 'p2pWithProvider' | 'p2pUnnamed' | 'p2pUnnamedWithProvider'

const toAlwaysAskConfirmationCondition = (
  { name, providerName }: Extract<CounterpartyAskCounterparty, { kind: 'p2p' }>,
): AlwaysAskConfirmationCondition => {
  if (name) return providerName ? 'p2pWithProvider' : 'p2p'

  return providerName ? 'p2pUnnamedWithProvider' : 'p2pUnnamed'
}

export type CounterpartyAskSaved = Pick<CounterpartyAskSubmission, 'answer' | 'wasCategorized'>

type UseCounterpartyAskFormProps = {
  task: AnyCounterpartyAskTask
  onSaved: (saved: CounterpartyAskSaved) => void
  /** The linked transactions changed and the rows started over, so any pane built on them is stale. */
  onRowsReset: () => void
}

export const useCounterpartyAskForm = ({ task, onSaved, onRowsReset }: UseCounterpartyAskFormProps) => {
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

        const counterparty = getCounterpartyAskCounterparty(task)

        if (submission.response.alwaysAsk && counterparty.kind === 'p2p') {
          addToast({
            content: tConditional(t, 'bookkeeping:TasksListItem.useCounterpartyAskForm.label.always_ask_confirmation', {
              condition: toAlwaysAskConfirmationCondition(counterparty),
              cases: {
                p2p: 'Got it. We’ll always ask you about future payments to {{counterparty}}.',
                p2pWithProvider: 'Got it. We’ll always ask you about future payments to {{counterparty}} via {{provider}}.',
                p2pUnnamed: 'Got it. We’ll always ask you about future payments like these.',
                p2pUnnamedWithProvider: 'Got it. We’ll always ask you about future {{provider}} payments like these.',
              },
              contexts: {
                p2p: 'p2p',
                p2pWithProvider: 'p2p_with_provider',
                p2pUnnamed: 'p2p_unnamed',
                p2pUnnamedWithProvider: 'p2p_unnamed_with_provider',
              },
              counterparty: counterparty.name,
              provider: counterparty.providerName,
            }),
            type: 'success',
          })
        }
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

    if (rowIds === linkedIds) return

    form.reset(getCounterpartyAskFormDefaultValues(task))
    onRowsReset()
  }, [form, linkedIds, onRowsReset, task])

  return useMemo(() => ({ form }), [form])
}

export type CounterpartyAskForm = ReturnType<typeof useCounterpartyAskForm>['form']

import { useEffect, useMemo } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormSubmissionResult } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useDebounce } from '@hooks/utils/debouncing/useDebounce'
import { usePutUnifiedAskFormDraft } from '@api/businesses/[business-id]/unified-tasks/[task-id]/draft/put'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { useAppForm } from '@blocks/Form/useForm'
import { useTaskAlreadyAnsweredError } from '@features/bookkeeping/UnifiedAskForm/useTaskAlreadyAnsweredError'
import { toAnswers } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import { syncSheetRows, toFormValues, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

export type UnifiedAskFormSubmitMeta = {
  pagesOnPath: ReadonlyArray<AskFormPage>
  onSubmitted?: () => void
}

const NO_SUBMIT_PATH: UnifiedAskFormSubmitMeta = { pagesOnPath: [] }

type UseUnifiedAskFormProps = {
  task: UnifiedAskFormTask
  onSaved: (saved: UnifiedAskFormSubmissionResult) => void
}

export const useUnifiedAskForm = ({ task, onSaved }: UseUnifiedAskFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger: submitResponse } = usePostUnifiedAskFormResponse()
  const { trigger: saveDraft } = usePutUnifiedAskFormDraft()
  const { handleTaskAlreadyAnsweredError } = useTaskAlreadyAnsweredError()

  const { pages } = task.form
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])
  const draftPages = useMemo(
    () => (task.status === BusinessTaskStatus.Todo ? pages.filter(page => page.steps.some(isSheetStep)) : []),
    [pages, task.status],
  )

  const saveDraftAnswers = useDebounce((values: UnifiedAskFormValues) => {
    const answers = toAnswers(draftPages, values, transactionIds)
    if (form.state.isSubmitting || Object.keys(answers).length === 0) return

    // A failed draft needs no retry: the next change saves the same rows again, and Submit posts every answer.
    saveDraft({ taskId: task.id, answers }).catch(() => undefined)
  })

  // A save that starts after unmount can outlive the SWR cache it writes to.
  useEffect(() => () => saveDraftAnswers.cancel(), [saveDraftAnswers])

  const defaultValues = useMemo<UnifiedAskFormValues>(
    () => toFormValues(pages, task.answers ?? {}, transactionIds),
    [pages, task.answers, transactionIds],
  )

  const form = useAppForm<UnifiedAskFormValues, UnifiedAskFormSubmitMeta>({
    defaultValues,
    onSubmitMeta: NO_SUBMIT_PATH,
    validationLogic: revalidateLogic(),
    // A field's own debounced listener is dropped when it unmounts, as a row editor does right after a pick.
    listeners: { onChange: ({ formApi }) => saveDraftAnswers(formApi.state.values) },
    onSubmit: async ({ value, meta: { pagesOnPath, onSubmitted } }) => {
      try {
        const saved = await submitResponse({
          taskId: task.id,
          answers: toAnswers(pagesOnPath, value, transactionIds),
        })

        form.reset(value)
        onSubmitted?.()
        onSaved(saved)
      }
      catch (error) {
        if (handleTaskAlreadyAnsweredError(error)) return

        addToast({
          content: t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.error.submit_answer', 'We couldn’t save that answer. Please try again.'),
          type: 'error',
        })
      }
    },
  })

  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  // A refetch that links or unlinks transactions changes which sheet rows the API requires.
  useEffect(() => {
    const synced = syncSheetRows(pages, form.state.values, task.answers ?? {}, transactionIds)
    if (synced) form.setFieldValue('pages', synced.pages, { dontUpdateMeta: true })
  }, [form, pages, task.answers, transactionIds])

  return useMemo(() => ({ form, isSubmitting }), [form, isSubmitting])
}

export type UnifiedAskFormApi = ReturnType<typeof useUnifiedAskForm>['form']

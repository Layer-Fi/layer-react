import { useEffect, useMemo } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { useRawAppForm } from '@blocks/Form/useForm'
import { toAnswers } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import { syncSheetRows, toFormValues, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

export type UnifiedAskFormSaved = {
  answerSummary: string | null
  categorized: boolean
}

export type UnifiedAskFormSubmitMeta = {
  pagesOnPath: ReadonlyArray<AskFormPage>
  onSubmitted?: () => void
}

const NO_SUBMIT_PATH: UnifiedAskFormSubmitMeta = { pagesOnPath: [] }

type UseUnifiedAskFormProps = {
  task: UnifiedAskFormTask
  onSaved: (saved: UnifiedAskFormSaved) => void
}

export const useUnifiedAskForm = ({ task, onSaved }: UseUnifiedAskFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger: submitResponse } = usePostUnifiedAskFormResponse()
  const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

  const { pages } = task.form
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])

  const defaultValues = useMemo<UnifiedAskFormValues>(
    () => toFormValues(pages, task.answers ?? {}, transactionIds),
    [pages, task.answers, transactionIds],
  )

  const form = useRawAppForm({
    defaultValues,
    onSubmitMeta: NO_SUBMIT_PATH,
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value, meta: { pagesOnPath, onSubmitted } }) => {
      try {
        const saved = await submitResponse({
          taskId: task.id,
          answers: toAnswers(pagesOnPath, value, transactionIds),
        })

        form.reset(value)
        onSubmitted?.()
        onSaved({ answerSummary: saved.task.answerSummary ?? null, categorized: saved.categorized })
      }
      catch (error) {
        if (isAPIErrorOfType(error, ApiEnumErrorType.BusinessTaskAlreadyCompleted)) {
          addToast({
            content: t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.error.already_answered', 'This task has already been answered.'),
            type: 'error',
          })
          void invalidateBookkeepingPeriods()
          return
        }

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
    if (synced) form.setFieldValue('pages', synced.pages)
  }, [form, pages, task.answers, transactionIds])

  return useMemo(() => ({ form, isSubmitting }), [form, isSubmitting])
}

export type UnifiedAskFormApi = ReturnType<typeof useUnifiedAskForm>['form']

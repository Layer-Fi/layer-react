import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind, type AskFormStaticNext } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useStepNavigation } from '@hooks/utils/navigation/useStepNavigation'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { useRawAppForm } from '@blocks/Form/useForm'
import {
  getPageNext,
  isPageComplete,
  syncSheetRows,
  toAnswers,
  toFormValues,
  type UnifiedAskFormValues,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormValues'

export type UnifiedAskFormView = { kind: 'PAGE', pageId: string } | { kind: 'REVIEW' }

const toPageView = (pageId: string): UnifiedAskFormView => ({ kind: 'PAGE', pageId })

export type UnifiedAskFormRouting = 'idle' | 'loading' | 'error'

export type UnifiedAskFormSaved = {
  answerSummary: string | null
  categorized: boolean
}

type UnifiedAskFormSubmitMeta = { pagesOnPath: ReadonlyArray<AskFormPage> }

const NO_SUBMIT_PATH: UnifiedAskFormSubmitMeta = { pagesOnPath: [] }

type UseUnifiedAskFormProps = {
  task: UnifiedAskFormTask
  onSaved: (saved: UnifiedAskFormSaved) => void
}

export const useUnifiedAskForm = ({ task, onSaved }: UseUnifiedAskFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger: submitResponse } = usePostUnifiedAskFormResponse()
  const { trigger: postNextPage } = usePostAskFormNextPage()
  const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

  const { pages, entryPageId } = task.form
  const pagesById = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const stepsById = useMemo(() => new Map(pages.flatMap(({ steps }) => steps.map(step => [step.id, step]))), [pages])
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])

  const entryView = useMemo((): UnifiedAskFormView => toPageView(entryPageId), [entryPageId])
  const navigation = useStepNavigation(entryView)

  const [routing, setRouting] = useState<UnifiedAskFormRouting>('idle')
  const routingRequestRef = useRef(0)

  const cancelRouting = useCallback(() => {
    routingRequestRef.current += 1
    setRouting('idle')
  }, [])

  const defaultValues = useMemo<UnifiedAskFormValues>(
    () => toFormValues(pages, task.answers ?? {}, transactionIds),
    [pages, task.answers, transactionIds],
  )

  const form = useRawAppForm({
    defaultValues,
    onSubmitMeta: NO_SUBMIT_PATH,
    validationLogic: revalidateLogic(),
    listeners: { onChange: cancelRouting },
    onSubmit: async ({ value, meta: { pagesOnPath } }) => {
      try {
        const saved = await submitResponse({
          taskId: task.id,
          answers: toAnswers(pagesOnPath, value, transactionIds),
        })

        form.reset(value)
        navigation.reset()
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

  const visitedPages = useMemo(
    () => navigation.history.flatMap((view) => {
      const page = view.kind === 'PAGE' ? pagesById.get(view.pageId) : undefined
      return page ? [page] : []
    }),
    [navigation.history, pagesById],
  )

  const getPageError = useCallback((page: AskFormPage, values: UnifiedAskFormValues) => {
    if (!isPageComplete(page, values, transactionIds)) {
      return t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.validation.answer_every_question', 'Answer every question to continue')
    }

    const leavesPages = getPageNext(page, values).kind !== AskFormNextKind.Page
    const hasAnswers = Object.keys(toAnswers([...visitedPages, page], values, transactionIds)).length > 0

    return leavesPages && !hasAnswers
      ? t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.validation.answer_required_to_continue', 'Add an answer to continue')
      : undefined
  }, [t, transactionIds, visitedPages])

  const submit = useCallback((pagesOnPath: ReadonlyArray<AskFormPage>) => {
    const incompletePage = pagesOnPath.find(page => !isPageComplete(page, form.state.values, transactionIds))

    if (incompletePage) {
      const history = pagesOnPath.slice(0, pagesOnPath.indexOf(incompletePage)).map(({ id }) => toPageView(id))
      navigation.goTo(toPageView(incompletePage.id), history)
      return
    }

    void form.handleSubmit({ pagesOnPath })
  }, [form, navigation, transactionIds])

  const follow = useCallback((next: AskFormStaticNext, pagesOnPath: ReadonlyArray<AskFormPage>) => {
    switch (next.kind) {
      case AskFormNextKind.Page:
        navigation.goForward(toPageView(next.pageId))
        return
      case AskFormNextKind.Submit:
        if (next.review) navigation.goForward({ kind: 'REVIEW' })
        else submit(pagesOnPath)
    }
  }, [navigation, submit])

  const continueFrom = useCallback((page: AskFormPage) => {
    const values = form.state.values
    const pagesOnPath = [...visitedPages, page]
    const next = getPageNext(page, values)

    if (next.kind !== AskFormNextKind.Server) {
      follow(next, pagesOnPath)
      return
    }

    const requestId = routingRequestRef.current + 1
    routingRequestRef.current = requestId
    setRouting('loading')

    postNextPage({
      url: next.url,
      request: {
        pageId: page.id,
        pageHistory: pagesOnPath.map(({ id }) => id),
        answers: toAnswers(pagesOnPath, values, transactionIds),
      },
    }).then(
      ({ next: serverNext }) => {
        if (routingRequestRef.current !== requestId) return

        setRouting('idle')
        follow(serverNext, pagesOnPath)
      },
      () => {
        if (routingRequestRef.current === requestId) setRouting('error')
      },
    )
  }, [follow, form, postNextPage, transactionIds, visitedPages])

  const goBack = useCallback(() => {
    cancelRouting()
    navigation.goBack()
  }, [cancelRouting, navigation])

  const reset = useCallback(() => {
    cancelRouting()
    navigation.reset()
  }, [cancelRouting, navigation])

  const submitReviewed = useCallback(() => submit(visitedPages), [submit, visitedPages])

  const { view, direction, canGoBack } = navigation
  const currentPage = view.kind === 'PAGE' ? pagesById.get(view.pageId) ?? null : null

  return useMemo(() => ({
    form,
    view,
    direction,
    currentPage,
    visitedPages,
    canGoBack,
    goBack,
    reset,
    routing,
    isSubmitting,
    stepsById,
    transactionIds,
    getPageError,
    continueFrom,
    submitReviewed,
  }), [
    canGoBack,
    continueFrom,
    currentPage,
    direction,
    form,
    getPageError,
    goBack,
    isSubmitting,
    reset,
    routing,
    stepsById,
    submitReviewed,
    transactionIds,
    view,
    visitedPages,
  ])
}

export type UnifiedAskFormState = ReturnType<typeof useUnifiedAskForm>

export type UnifiedAskFormApi = UnifiedAskFormState['form']

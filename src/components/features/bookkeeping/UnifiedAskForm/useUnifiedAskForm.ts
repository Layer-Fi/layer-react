import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useStepNavigation } from '@hooks/utils/navigation/useStepNavigation'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { useRawAppForm } from '@blocks/Form/useForm'
import { isApiOriginUrl } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'
import {
  getPageNext,
  isPageComplete,
  syncSheetRows,
  toAnswers,
  toFormValues,
  type UnifiedAskFormValues,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormValues'

export const FALLBACK_PAGE_ID = '__fallback'

export type UnifiedAskFormView = { kind: 'PAGE', pageId: string } | { kind: 'REVIEW' }

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

  const fallbackPage = useMemo<AskFormPage>(() => ({
    id: FALLBACK_PAGE_ID,
    next: { kind: AskFormNextKind.Submit, review: false },
    steps: [{
      id: FALLBACK_PAGE_ID,
      type: AskFormStepType.Text,
      prompt: t(
        'bookkeeping:UnifiedAskForm.useUnifiedAskForm.prompt.anything_else',
        'Is there anything else we should know about these transactions?',
      ),
      placeholder: null,
      multiline: true,
      required: true,
    }],
  }), [t])

  const { pages, entryPageId } = task.form
  const allPages = useMemo(() => [...pages, fallbackPage], [fallbackPage, pages])
  const pagesById = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const stepsById = useMemo(() => new Map(allPages.flatMap(({ steps }) => steps.map(step => [step.id, step]))), [allPages])
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])

  const getPage = useCallback((pageId: string) => pagesById.get(pageId) ?? fallbackPage, [fallbackPage, pagesById])
  const toPageView = useCallback((pageId: string): UnifiedAskFormView =>
    ({ kind: 'PAGE', pageId: pagesById.has(pageId) ? pageId : FALLBACK_PAGE_ID }), [pagesById])

  const entryView = useMemo(() => toPageView(entryPageId), [entryPageId, toPageView])
  const navigation = useStepNavigation(entryView)

  const [routing, setRouting] = useState<UnifiedAskFormRouting>('idle')
  const routingRequestRef = useRef(0)

  const cancelRouting = useCallback(() => {
    routingRequestRef.current += 1
    setRouting('idle')
  }, [])

  const defaultValues = useMemo<UnifiedAskFormValues>(
    () => toFormValues(allPages, task.answers ?? {}, transactionIds),
    [allPages, task.answers, transactionIds],
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
    const synced = syncSheetRows(allPages, form.state.values, task.answers ?? {}, transactionIds)
    if (synced) form.setFieldValue('pages', synced.pages)
  }, [allPages, form, task.answers, transactionIds])

  const visitedPages = useMemo(
    () => navigation.history.flatMap(view => (view.kind === 'PAGE' ? [getPage(view.pageId)] : [])),
    [getPage, navigation.history],
  )

  const getPageError = useCallback((page: AskFormPage, values: UnifiedAskFormValues) => {
    if (!isPageComplete(page, values, transactionIds)) {
      return t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.validation.answer_every_question', 'Answer every question to continue')
    }

    const submitsNext = getPageNext(page, values).kind === AskFormNextKind.Submit
    const hasAnswers = Object.keys(toAnswers([...visitedPages, page], values, transactionIds)).length > 0

    return submitsNext && !hasAnswers
      ? t('bookkeeping:UnifiedAskForm.useUnifiedAskForm.validation.answer_required', 'Add an answer to submit')
      : undefined
  }, [t, transactionIds, visitedPages])

  const submit = useCallback((pagesOnPath: ReadonlyArray<AskFormPage>) => {
    const incompletePage = pagesOnPath.find(page => !isPageComplete(page, form.state.values, transactionIds))

    if (incompletePage) {
      const history = pagesOnPath.slice(0, pagesOnPath.indexOf(incompletePage)).map(({ id }) => toPageView(id))
      navigation.goTo(toPageView(incompletePage.id), history)
      return
    }

    if (Object.keys(toAnswers(pagesOnPath, form.state.values, transactionIds)).length === 0) {
      navigation.goForward(toPageView(FALLBACK_PAGE_ID))
      return
    }

    void form.handleSubmit({ pagesOnPath })
  }, [form, navigation, toPageView, transactionIds])

  const follow = useCallback((next: AskFormNext, pagesOnPath: ReadonlyArray<AskFormPage>) => {
    switch (next.kind) {
      case AskFormNextKind.Page:
        navigation.goForward(toPageView(next.pageId))
        return
      case AskFormNextKind.Submit:
        if (next.review) navigation.goForward({ kind: 'REVIEW' })
        else submit(pagesOnPath)
        return
      case AskFormNextKind.Server:
        navigation.goForward(toPageView(FALLBACK_PAGE_ID))
    }
  }, [navigation, submit, toPageView])

  const continueFrom = useCallback((page: AskFormPage) => {
    const values = form.state.values
    const pagesOnPath = [...visitedPages, page]
    const next = getPageNext(page, values)

    if (next.kind !== AskFormNextKind.Server) {
      follow(next, pagesOnPath)
      return
    }

    if (!isApiOriginUrl(next.url)) {
      navigation.goForward(toPageView(FALLBACK_PAGE_ID))
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
  }, [follow, form, navigation, postNextPage, toPageView, transactionIds, visitedPages])

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
  const currentPage = view.kind === 'PAGE' ? getPage(view.pageId) : null

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

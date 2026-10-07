import { useCallback, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormAnswer, type AskFormAnswers } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { ASK_FORM_NEXT_PAGE_SUBMIT } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { type SlidingPanesDirection } from '@components/utility/SlidingPanes/SlidingPanes'
import { useForm } from '@blocks/Form/useForm'
import {
  type AskFormLabels,
  getChosenOptionNext,
  isApiOriginUrl,
  isPageComplete,
  pickAnswersForPages,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

export const FALLBACK_PAGE_ID = '__fallback'

export type UnifiedAskFormView = { kind: 'PAGE', pageId: string } | { kind: 'REVIEW' }

type NavigationState = {
  view: UnifiedAskFormView
  history: ReadonlyArray<string>
  direction: SlidingPanesDirection
}

export type UnifiedAskFormRouting = 'idle' | 'loading' | 'error'

type UnifiedAskFormValues = {
  answers: AskFormAnswers
  labels: AskFormLabels
}

export type UnifiedAskFormSaved = {
  answerSummary: string | null
  categorized: boolean
}

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
  const pagesById = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const stepsById = useMemo(() => new Map(pages.flatMap(({ steps }) => steps.map(step => [step.id, step]))), [pages])

  const getPage = useCallback((pageId: string) => pagesById.get(pageId) ?? fallbackPage, [fallbackPage, pagesById])

  const atEntry = useMemo<NavigationState>(() => ({
    view: { kind: 'PAGE', pageId: pagesById.has(entryPageId) ? entryPageId : FALLBACK_PAGE_ID },
    history: [],
    direction: 'back',
  }), [entryPageId, pagesById])

  const [navigation, setNavigation] = useState<NavigationState>(atEntry)
  const [routing, setRouting] = useState<UnifiedAskFormRouting>('idle')
  const submitPathRef = useRef<ReadonlyArray<AskFormPage>>([])

  const form = useForm<UnifiedAskFormValues>({
    defaultValues: { answers: task.answers ?? {}, labels: {} },
    onSubmit: async ({ value }) => {
      try {
        const saved = await submitResponse({
          taskId: task.id,
          answers: pickAnswersForPages(submitPathRef.current, value.answers),
        })

        form.reset({ answers: saved.task.answers ?? value.answers, labels: value.labels })
        setNavigation(atEntry)
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

  const answers = useStore(form.store, state => state.values.answers)
  const labels = useStore(form.store, state => state.values.labels)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const setAnswer = useCallback((stepId: string, answer: AskFormAnswer) => {
    form.setFieldValue('answers', current => ({ ...current, [stepId]: answer }))
  }, [form])

  const setLabel = useCallback((id: string, label: string) => {
    form.setFieldValue('labels', current => ({ ...current, [id]: label }))
  }, [form])

  const goForward = useCallback((view: UnifiedAskFormView) => {
    setNavigation(current => ({
      view,
      history: current.view.kind === 'PAGE' ? [...current.history, current.view.pageId] : current.history,
      direction: 'forward',
    }))
  }, [])

  const goBack = useCallback(() => {
    setRouting('idle')
    setNavigation((current) => {
      const previous = current.history.at(-1)

      return previous
        ? { view: { kind: 'PAGE', pageId: previous }, history: current.history.slice(0, -1), direction: 'back' }
        : current
    })
  }, [])

  const reset = useCallback(() => {
    setRouting('idle')
    setNavigation(atEntry)
  }, [atEntry])

  const submit = useCallback((pagesOnPath: ReadonlyArray<AskFormPage>) => {
    submitPathRef.current = pagesOnPath
    void form.handleSubmit()
  }, [form])

  const follow = useCallback((next: AskFormNext, pagesOnPath: ReadonlyArray<AskFormPage>) => {
    switch (next.kind) {
      case AskFormNextKind.Page:
        goForward({ kind: 'PAGE', pageId: pagesById.has(next.pageId) ? next.pageId : FALLBACK_PAGE_ID })
        return
      case AskFormNextKind.Submit:
        if (next.review) goForward({ kind: 'REVIEW' })
        else submit(pagesOnPath)
        return
      case AskFormNextKind.Server:
        goForward({ kind: 'PAGE', pageId: FALLBACK_PAGE_ID })
    }
  }, [goForward, pagesById, submit])

  const continueFrom = useCallback((page: AskFormPage, currentAnswers: AskFormAnswers) => {
    if (!isPageComplete(page, currentAnswers, task.transactions.length)) return

    const pagesOnPath = [...navigation.history.map(getPage), page]

    if (page.next.kind !== AskFormNextKind.Server) {
      follow(getChosenOptionNext(page, currentAnswers) ?? page.next, pagesOnPath)
      return
    }

    if (!isApiOriginUrl(page.next.url)) {
      goForward({ kind: 'PAGE', pageId: FALLBACK_PAGE_ID })
      return
    }

    setRouting('loading')

    postNextPage({
      url: page.next.url,
      request: {
        pageId: page.id,
        pageHistory: pagesOnPath.map(({ id }) => id),
        answers: pickAnswersForPages(pagesOnPath, currentAnswers),
      },
    }).then(
      ({ nextPageId }) => {
        setRouting('idle')
        follow(
          nextPageId === ASK_FORM_NEXT_PAGE_SUBMIT
            ? { kind: AskFormNextKind.Submit, review: false }
            : { kind: AskFormNextKind.Page, pageId: nextPageId },
          pagesOnPath,
        )
      },
      () => setRouting('error'),
    )
  }, [follow, getPage, goForward, navigation.history, postNextPage, task.transactions.length])

  const submitReviewed = useCallback(() => {
    submit(navigation.history.map(getPage))
  }, [getPage, navigation.history, submit])

  const currentPage = navigation.view.kind === 'PAGE' ? getPage(navigation.view.pageId) : null
  const visitedPages = useMemo(() => navigation.history.map(getPage), [getPage, navigation.history])

  return useMemo(() => ({
    form,
    answers,
    labels,
    setAnswer,
    setLabel,
    stepsById,
    view: navigation.view,
    direction: navigation.direction,
    currentPage,
    visitedPages,
    canGoBack: navigation.history.length > 0,
    goBack,
    reset,
    routing,
    isSubmitting,
    continueFrom,
    submitReviewed,
  }), [
    answers,
    continueFrom,
    currentPage,
    form,
    goBack,
    isSubmitting,
    labels,
    navigation.direction,
    navigation.history.length,
    navigation.view,
    reset,
    routing,
    setAnswer,
    setLabel,
    stepsById,
    submitReviewed,
    visitedPages,
  ])
}

export type UnifiedAskFormState = ReturnType<typeof useUnifiedAskForm>

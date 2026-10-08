import { useCallback, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind, type AskFormStaticNext } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useStepNavigation } from '@hooks/utils/navigation/useStepNavigation'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { toAnswers } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import { isPageComplete } from '@features/bookkeeping/UnifiedAskForm/utils/completion'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { getPageNext } from '@features/bookkeeping/UnifiedAskForm/utils/routing'

export type UnifiedAskFormView = { kind: 'PAGE', pageId: string } | { kind: 'REVIEW' }

export type UnifiedAskFormRouting = 'idle' | 'loading' | 'error'

type PendingRoute = {
  requestId: number
  values: UnifiedAskFormValues
  hasFailed: boolean
}

const toPageView = (pageId: string): UnifiedAskFormView => ({ kind: 'PAGE', pageId })

type UseUnifiedAskFormNavigationProps = {
  task: UnifiedAskFormTask
  form: UnifiedAskFormApi
}

export const useUnifiedAskFormNavigation = ({ task, form }: UseUnifiedAskFormNavigationProps) => {
  const { t } = useTranslation()
  const { trigger: postNextPage } = usePostAskFormNextPage()

  const { pages, entryPageId } = task.form
  const pagesById = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const stepsById = useMemo(() => new Map(pages.flatMap(({ steps }) => steps.map(step => [step.id, step]))), [pages])
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])

  const entryView = useMemo(() => toPageView(entryPageId), [entryPageId])
  const steps = useStepNavigation(entryView)

  // A pending SERVER route only counts while the answers it was sent with are unchanged.
  const [pendingRoute, setPendingRoute] = useState<PendingRoute | null>(null)
  const requestIdRef = useRef(0)
  const isRouteCurrent = useStore(form.store, state => pendingRoute !== null && state.values === pendingRoute.values)

  const getRouting = (): UnifiedAskFormRouting => {
    if (!isRouteCurrent) return 'idle'
    return pendingRoute?.hasFailed ? 'error' : 'loading'
  }
  const routing = getRouting()

  const clearRoute = useCallback(() => {
    requestIdRef.current += 1
    setPendingRoute(null)
  }, [])

  const goBack = useCallback(() => {
    clearRoute()
    steps.goBack()
  }, [clearRoute, steps])

  const reset = useCallback(() => {
    clearRoute()
    steps.reset()
  }, [clearRoute, steps])

  const visitedPages = useMemo(
    () => steps.history.flatMap((view) => {
      const page = view.kind === 'PAGE' ? pagesById.get(view.pageId) : undefined
      return page ? [page] : []
    }),
    [pagesById, steps.history],
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
    // A refetch can add sheet rows to a page that was complete when the customer left it.
    const incompletePage = pagesOnPath.find(page => !isPageComplete(page, form.state.values, transactionIds))

    if (incompletePage) {
      const history = pagesOnPath.slice(0, pagesOnPath.indexOf(incompletePage)).map(({ id }) => toPageView(id))
      steps.goTo(toPageView(incompletePage.id), history)
      return
    }

    void form.handleSubmit({ pagesOnPath, onSubmitted: reset })
  }, [form, reset, steps, transactionIds])

  const follow = useCallback((next: AskFormStaticNext, pagesOnPath: ReadonlyArray<AskFormPage>) => {
    switch (next.kind) {
      case AskFormNextKind.Page:
        steps.goForward(toPageView(next.pageId))
        return
      case AskFormNextKind.Submit:
        if (next.review) steps.goForward({ kind: 'REVIEW' })
        else submit(pagesOnPath)
    }
  }, [steps, submit])

  const continueFrom = useCallback((page: AskFormPage) => {
    const values = form.state.values
    const pagesOnPath = [...visitedPages, page]
    const next = getPageNext(page, values)

    if (next.kind !== AskFormNextKind.Server) {
      follow(next, pagesOnPath)
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setPendingRoute({ requestId, values, hasFailed: false })

    const isCurrent = () => requestIdRef.current === requestId && form.state.values === values

    postNextPage({
      url: next.url,
      request: {
        pageId: page.id,
        pageHistory: pagesOnPath.map(({ id }) => id),
        answers: toAnswers(pagesOnPath, values, transactionIds),
      },
    }).then(
      ({ next: serverNext }) => {
        if (!isCurrent()) return

        setPendingRoute(null)
        follow(serverNext, pagesOnPath)
      },
      () => {
        if (isCurrent()) setPendingRoute({ requestId, values, hasFailed: true })
      },
    )
  }, [follow, form, postNextPage, transactionIds, visitedPages])

  const submitReviewed = useCallback(() => submit(visitedPages), [submit, visitedPages])

  const { view, direction, canGoBack } = steps
  const currentPage = view.kind === 'PAGE' ? pagesById.get(view.pageId) ?? null : null

  return useMemo(() => ({
    view,
    direction,
    currentPage,
    visitedPages,
    canGoBack,
    goBack,
    reset,
    routing,
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
    getPageError,
    goBack,
    reset,
    routing,
    stepsById,
    submitReviewed,
    transactionIds,
    view,
    visitedPages,
  ])
}

export type UnifiedAskFormNavigation = ReturnType<typeof useUnifiedAskFormNavigation>

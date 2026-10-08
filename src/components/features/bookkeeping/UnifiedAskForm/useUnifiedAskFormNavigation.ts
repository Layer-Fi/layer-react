import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind, type AskFormStaticNext } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useStepNavigation } from '@hooks/utils/navigation/useStepNavigation'
import { useNextPageRouting } from '@features/bookkeeping/UnifiedAskForm/useNextPageRouting'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { toAnswers } from '@features/bookkeeping/UnifiedAskForm/utils/answers'
import { findFirstIncompletePage, getPageProblem } from '@features/bookkeeping/UnifiedAskForm/utils/completion'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { getVisitedPages, indexPages, toPageView } from '@features/bookkeeping/UnifiedAskForm/utils/pages'
import { getPageNext } from '@features/bookkeeping/UnifiedAskForm/utils/routing'

type UseUnifiedAskFormNavigationProps = {
  task: UnifiedAskFormTask
  form: UnifiedAskFormApi
}

export const useUnifiedAskFormNavigation = ({ task, form }: UseUnifiedAskFormNavigationProps) => {
  const { t } = useTranslation()
  const { routing, requestNextPage, cancel: cancelRouting } = useNextPageRouting(form)

  const { pages, entryPageId } = task.form
  const { pagesById, stepsById } = useMemo(() => indexPages(pages), [pages])
  const transactionIds = useMemo(() => task.transactions.map(({ id }) => id), [task.transactions])

  const entryView = useMemo(() => toPageView(entryPageId), [entryPageId])
  const steps = useStepNavigation(entryView)
  const visitedPages = useMemo(() => getVisitedPages(steps.history, pagesById), [pagesById, steps.history])

  const goBack = useCallback(() => {
    cancelRouting()
    steps.goBack()
  }, [cancelRouting, steps])

  const reset = useCallback(() => {
    cancelRouting()
    steps.reset()
  }, [cancelRouting, steps])

  const getPageError = useCallback((page: AskFormPage, values: UnifiedAskFormValues) => {
    switch (getPageProblem(page, values, visitedPages, transactionIds)) {
      case 'incomplete':
        return t('bookkeeping:UnifiedAskForm.useUnifiedAskFormNavigation.validation.answer_every_question', 'Answer every question to continue')
      case 'nothing_to_post':
        return t('bookkeeping:UnifiedAskForm.useUnifiedAskFormNavigation.validation.answer_required_to_continue', 'Add an answer to continue')
      default:
        return undefined
    }
  }, [t, transactionIds, visitedPages])

  const submit = useCallback((pagesOnPath: ReadonlyArray<AskFormPage>) => {
    // A refetch can add sheet rows to a page that was complete when the customer left it.
    const incompletePage = findFirstIncompletePage(pagesOnPath, form.state.values, transactionIds)

    if (incompletePage) {
      const pagesBefore = pagesOnPath.slice(0, pagesOnPath.indexOf(incompletePage))
      steps.goTo(toPageView(incompletePage.id), pagesBefore.map(({ id }) => toPageView(id)))
      return
    }

    void form.handleSubmit({ pagesOnPath, onSubmitted: reset })
  }, [form, reset, steps, transactionIds])

  const follow = useCallback((next: AskFormStaticNext, pagesOnPath: ReadonlyArray<AskFormPage>) => {
    if (next.kind === AskFormNextKind.Page) steps.goForward(toPageView(next.pageId))
    else if (next.review) steps.goForward({ kind: 'REVIEW' })
    else submit(pagesOnPath)
  }, [steps, submit])

  const continueFrom = useCallback((page: AskFormPage) => {
    const values = form.state.values
    const pagesOnPath = [...visitedPages, page]
    const next = getPageNext(page, values)

    if (next.kind !== AskFormNextKind.Server) {
      follow(next, pagesOnPath)
      return
    }

    void requestNextPage(next.url, {
      pageId: page.id,
      pageHistory: pagesOnPath.map(({ id }) => id),
      answers: toAnswers(pagesOnPath, values, transactionIds),
    }, (serverNext) => {
      if (serverNext.kind === AskFormNextKind.Page && !pagesById.has(serverNext.pageId)) return false

      follow(serverNext, pagesOnPath)
      return true
    })
  }, [follow, form, pagesById, requestNextPage, transactionIds, visitedPages])

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

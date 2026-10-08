import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'

export type UnifiedAskFormView = { kind: 'PAGE', pageId: string } | { kind: 'REVIEW' }

export const toPageView = (pageId: string): UnifiedAskFormView => ({ kind: 'PAGE', pageId })

export const indexPages = (pages: ReadonlyArray<AskFormPage>) => ({
  pagesById: new Map(pages.map(page => [page.id, page])),
  stepsById: new Map(pages.flatMap(({ steps }) => steps.map(step => [step.id, step]))),
})

export const getVisitedPages = (history: ReadonlyArray<UnifiedAskFormView>, pagesById: ReadonlyMap<string, AskFormPage>) =>
  history.flatMap((view) => {
    const page = view.kind === 'PAGE' ? pagesById.get(view.pageId) : undefined
    return page ? [page] : []
  })

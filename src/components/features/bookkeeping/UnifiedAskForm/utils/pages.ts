import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { isPageComplete } from '@features/bookkeeping/UnifiedAskForm/utils/completion'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { getPageNext } from '@features/bookkeeping/UnifiedAskForm/utils/routing'

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

/** The pages a draft already answers, from the entry page to the first one it leaves unfinished. */
export const getDraftPath = (
  entryPageId: string,
  pagesById: ReadonlyMap<string, AskFormPage>,
  values: UnifiedAskFormValues,
  transactionIds: ReadonlyArray<string>,
) => {
  const path: AskFormPage[] = []

  for (let page = pagesById.get(entryPageId); page && !path.includes(page);) {
    path.push(page)
    const next = getPageNext(page, values)
    if (!isPageComplete(page, values, transactionIds) || next.kind !== AskFormNextKind.Page) break
    page = pagesById.get(next.pageId)
  }

  return path
}

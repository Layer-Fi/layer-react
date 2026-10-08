import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { findOption } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

/** An option's `next` beats the page's on a static page; at most one step per page routes. */
export const getPageNext = (page: AskFormPage, values: UnifiedAskFormValues): AskFormNext => {
  if (page.next.kind === AskFormNextKind.Server) return page.next

  const optionNext = page.steps
    .map(step => findOption(step, values.pages[page.id]?.[step.id]?.choice ?? null)?.next)
    .find(next => next)

  return optionNext ?? page.next
}

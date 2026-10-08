import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { getPickedValue, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { findOption } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

/** An option's `next` beats the page's on a static page; at most one step per page routes. */
export const getPageNext = (page: AskFormPage, values: UnifiedAskFormValues): AskFormNext => {
  if (page.next.kind === AskFormNextKind.Server) return page.next

  const optionNext = page.steps
    .map((step) => {
      const stepValues = values.pages[page.id]?.[step.id]
      return stepValues ? findOption(step, getPickedValue(stepValues))?.next : undefined
    })
    .find(next => next)

  return optionNext ?? page.next
}

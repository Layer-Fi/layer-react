import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormAction, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { getPickedValue } from '@utils/shared/form/pickedValue'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
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

export type AskFormPagePrimaryAction = 'CONNECT_ACCOUNT' | 'REVIEW' | 'SUBMIT' | 'NEXT'

export const getPagePrimaryAction = (page: AskFormPage, values: UnifiedAskFormValues): AskFormPagePrimaryAction => {
  if (page.steps.some(step => step.type === AskFormStepType.Action && step.action === AskFormAction.ConnectAccount)) return 'CONNECT_ACCOUNT'

  const next = getPageNext(page, values)
  if (next.kind === AskFormNextKind.Submit) return next.review ? 'REVIEW' : 'SUBMIT'

  return 'NEXT'
}

/** A page with one auto-advancing CHOICE continues on a pick, unless the server routes it. */
export const canAutoAdvance = (page: AskFormPage) => {
  const [onlyStep, ...otherSteps] = page.steps

  return otherSteps.length === 0
    && onlyStep?.type === AskFormStepType.Choice
    && onlyStep.autoAdvance
    && page.next.kind !== AskFormNextKind.Server
}

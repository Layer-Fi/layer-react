import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormAction, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { getPickedValue } from '@utils/shared/form/pickedValue'
import { getFollowUpStep, type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findOption, isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

export type UnifiedAskFormPresentation = 'inline' | 'takeover'

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

const isPickStep = (step: AskFormStepFields) => {
  switch (step.type) {
    case AskFormStepType.Choice:
    case AskFormStepType.Category:
    case AskFormStepType.Search:
    case AskFormStepType.SearchWithFreeform:
      return !isSheetStep(step)
    case AskFormStepType.Text:
    case AskFormStepType.Action:
    case AskFormStepType.Upload:
      return false
  }
}

/**
 * A page with one auto-advancing CHOICE continues on a pick, unless the server routes it.
 * The takeover continues on any single pick, since it has no inline Next to fall back on.
 */
export const canAutoAdvance = (page: AskFormPage, presentation: UnifiedAskFormPresentation) => {
  const [onlyStep, ...otherSteps] = page.steps
  if (!onlyStep || otherSteps.length > 0 || !onlyStep.editable) return false

  if (presentation === 'takeover') return isPickStep(onlyStep)

  return onlyStep.type === AskFormStepType.Choice
    && onlyStep.autoAdvance
    && page.next.kind !== AskFormNextKind.Server
}

export const hasPickedFollowUp = (page: AskFormPage, values: UnifiedAskFormValues) =>
  page.steps.some((step) => {
    const stepValues = values.pages[page.id]?.[step.id]
    return stepValues ? getFollowUpStep(step, stepValues) !== undefined : false
  })

import { type AskFormAnswerValues, type AskFormInputValues, getFollowUpStep } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findOption } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

export const getInputLabel = (step: AskFormStepFields, { choice, selection, text }: AskFormInputValues) => {
  if (selection) return selection.label
  if (choice) return findOption(step, choice)?.label ?? choice
  return text.trim() || null
}

/** A choice follow-up reads as its own pick; a free-text one reads as the option it explains. */
export const getChoiceLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)
  const followUpPick = followUpStep && !values.followUp.text.trim() ? getInputLabel(followUpStep, values.followUp) : null

  return followUpPick ?? getInputLabel(step, values)
}

export const getFollowUpLabel = (step: AskFormStepFields, values: AskFormAnswerValues) => {
  const followUpStep = getFollowUpStep(step, values)
  return followUpStep ? getInputLabel(followUpStep, values.followUp) : null
}

/** Fills `{{answer.<step>.label}}` and `{{answer.<step>.follow_up.label}}` placeholders in a prompt. */
export const fillPromptTemplate = (
  text: string | null | undefined,
  getLabel: (stepId: string, isFollowUp: boolean) => string | null,
  unansweredLabel: string,
) => text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) =>
  getLabel(stepId, followUp !== undefined) ?? unansweredLabel) ?? null

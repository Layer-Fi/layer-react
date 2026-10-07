import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormChoiceAnswer,
  type AskFormFollowUpAnswer,
  type AskFormRowAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import {
  AskFormCategoryScope,
  type AskFormFollowUp,
  type AskFormOption,
  type AskFormStep,
  AskFormStepType,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

export type AskFormStepFields = AskFormStep | AskFormFollowUp

export type AskFormStepOption = Pick<AskFormOption, 'value' | 'label'> & Partial<Pick<AskFormOption, 'next' | 'followUp'>>

export type AskFormLabels = Readonly<Record<string, string>>

export const getStepOptions = (step: AskFormStepFields): ReadonlyArray<AskFormStepOption> =>
  ('options' in step ? step.options : [])

export const findChosenOption = (step: AskFormStepFields, answer: AskFormAnswer | undefined) =>
  (answer && 'choice' in answer ? getStepOptions(step).find(({ value }) => value === answer.choice) : undefined)

export const isSheetStep = (step: AskFormStepFields) =>
  step.type === AskFormStepType.Category && step.scope === AskFormCategoryScope.EachTransaction

const isChoiceOrTextAnswered = (step: AskFormStepFields, answer: AskFormAnswer, depth: number): boolean => {
  if ('choice' in answer) {
    const followUp = findChosenOption(step, answer)?.followUp

    return !followUp || depth > 0 || isStepAnswered(followUp, answer.followUp, [], depth + 1)
  }

  return 'text' in answer && answer.text.trim().length > 0
}

export const isRowAnswered = (step: AskFormStepFields, answer: AskFormRowAnswer | undefined) =>
  answer !== undefined && isChoiceOrTextAnswered(step, answer, 0)

export function isStepAnswered(
  step: AskFormStepFields,
  answer: AskFormAnswer | undefined,
  transactionIds: ReadonlyArray<string>,
  depth = 0,
): boolean {
  if (step.type === AskFormStepType.Action) return true
  if (step.type === AskFormStepType.Text && !step.required) return true

  if (isSheetStep(step)) {
    const rows = answer && 'transactionAnswers' in answer ? answer.transactionAnswers : []

    return transactionIds.every(transactionId =>
      isRowAnswered(step, rows.find(row => row.transactionId === transactionId)?.answer))
  }

  if (!answer) return false
  if (step.type === AskFormStepType.Upload) return 'documentIds' in answer && answer.documentIds.length > 0

  return isChoiceOrTextAnswered(step, answer, depth)
}

export const isPageComplete = (page: AskFormPage, answers: AskFormAnswers, transactionIds: ReadonlyArray<string>) =>
  page.steps.every(step => isStepAnswered(step, answers[step.id], transactionIds))

export const toFollowUpAnswer = (answer: AskFormAnswer): AskFormFollowUpAnswer | undefined => {
  if ('choice' in answer) return { choice: answer.choice }
  if ('text' in answer) return answer
  return undefined
}

const getChosenOptionNext = (page: AskFormPage, answers: AskFormAnswers): AskFormNext | null => {
  for (const step of page.steps) {
    const next = findChosenOption(step, answers[step.id])?.next

    if (next) return next
  }

  return null
}

/** An option's `next` beats the page's on a static page; at most one step per page routes. */
export const getPageNext = (page: AskFormPage, answers: AskFormAnswers): AskFormNext =>
  (page.next.kind === AskFormNextKind.Server ? page.next : getChosenOptionNext(page, answers) ?? page.next)

const hasText = ({ text }: { text: string }) => text.trim().length > 0

const withoutBlankFollowUp = (answer: AskFormChoiceAnswer): AskFormChoiceAnswer =>
  (answer.followUp && 'text' in answer.followUp && !hasText(answer.followUp) ? { choice: answer.choice } : answer)

const toPostedRow = (answer: AskFormRowAnswer): AskFormRowAnswer | null => {
  if ('choice' in answer) return withoutBlankFollowUp(answer)
  return hasText(answer) ? answer : null
}

// The API rejects blank text, so an optional TEXT the customer left empty is left out entirely.
const toPostedAnswer = (answer: AskFormAnswer): AskFormAnswer | null => {
  if ('choice' in answer) return withoutBlankFollowUp(answer)
  if ('text' in answer) return hasText(answer) ? answer : null
  if ('transactionAnswers' in answer) {
    const transactionAnswers = answer.transactionAnswers.flatMap((row) => {
      const posted = toPostedRow(row.answer)
      return posted ? [{ transactionId: row.transactionId, answer: posted }] : []
    })

    return transactionAnswers.length > 0 ? { transactionAnswers } : null
  }

  return answer
}

export const pickAnswersForPages = (pages: ReadonlyArray<AskFormPage>, answers: AskFormAnswers): AskFormAnswers => {
  const stepIds = new Set(pages.flatMap(({ steps }) => steps.map(({ id }) => id)))

  return Object.fromEntries(Object.entries(answers).flatMap(([stepId, answer]) => {
    const posted = stepIds.has(stepId) ? toPostedAnswer(answer) : null
    return posted ? [[stepId, posted]] : []
  }))
}

export const hasAnswersToPost = (pages: ReadonlyArray<AskFormPage>, answers: AskFormAnswers) =>
  Object.keys(pickAnswersForPages(pages, answers)).length > 0

/** The API rejects a SERVER url off its own origin; the client never posts answers anywhere else. */
export const isApiOriginUrl = (url: string) => url.startsWith('/v1/')

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

const UNANSWERED_PLACEHOLDER = '…'

export const fillPromptTemplate = (
  text: string | null | undefined,
  stepsById: ReadonlyMap<string, AskFormStep>,
  answers: AskFormAnswers,
  getLabel: (step: AskFormStepFields, answer: AskFormAnswer | undefined) => string | null,
) =>
  text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) => {
    const step = stepsById.get(stepId)
    const answer = answers[stepId]

    if (!step || !answer) return UNANSWERED_PLACEHOLDER
    if (!followUp) return getLabel(step, answer) ?? UNANSWERED_PLACEHOLDER

    const followUpStep = findChosenOption(step, answer)?.followUp

    return followUpStep && 'choice' in answer
      ? getLabel(followUpStep, answer.followUp) ?? UNANSWERED_PLACEHOLDER
      : UNANSWERED_PLACEHOLDER
  }) ?? null

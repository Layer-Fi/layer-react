import {
  AskFormCategoryScope,
  type AskFormChecklistItem,
  AskFormChecklistRequirement,
  type AskFormFollowUp,
  type AskFormOption,
  type AskFormStep,
  AskFormStepType,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

export type AskFormStepFields = AskFormStep | AskFormFollowUp

// A follow-up's options are plain `{ value, label }`, which fits `AskFormOption` with no `next` or `followUp`.
export const getStepOptions = (step: AskFormStepFields): ReadonlyArray<AskFormOption> =>
  ('options' in step ? step.options : [])

export const findOption = (step: AskFormStepFields, value: string | null) =>
  (value === null ? undefined : getStepOptions(step).find(option => option.value === value))

/** The API takes only a choice or text follow-up, so an UPLOAD or ACTION one is skipped. */
export const findFollowUp = (step: AskFormStepFields, value: string | null) => {
  const followUp = findOption(step, value)?.followUp

  return followUp && followUp.type !== AskFormStepType.Upload && followUp.type !== AskFormStepType.Action ? followUp : undefined
}

export type AskFormChecklistStep = Extract<AskFormStepFields, { type: AskFormStepType.Checklist }>

export const isChecklistItemRequired = (require: AskFormChecklistRequirement, { required }: AskFormChecklistItem) =>
  require === AskFormChecklistRequirement.All || (require === AskFormChecklistRequirement.Items && required)

export const getCheckedItems = ({ items }: AskFormChecklistStep, checked: ReadonlyArray<string>) =>
  items.filter(({ value }) => checked.includes(value))

export const isChecklistSatisfied = ({ items, require }: AskFormChecklistStep, checked: ReadonlyArray<string>) => {
  const checkedValues = new Set(checked)

  switch (require) {
    case AskFormChecklistRequirement.AtLeastOne:
      return items.some(({ value }) => checkedValues.has(value))
    case AskFormChecklistRequirement.All:
    case AskFormChecklistRequirement.Items:
    case AskFormChecklistRequirement.None:
      return items.every(item => !isChecklistItemRequired(require, item) || checkedValues.has(item.value))
  }
}

export const isSheetStep = (step: AskFormStepFields) =>
  step.type === AskFormStepType.Category && step.scope === AskFormCategoryScope.EachTransaction

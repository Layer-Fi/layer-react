import { useFieldGroup } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { TextStep } from '@blocks/FormSteps/TextStep'
import { UnifiedAskFormSearchChoice } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormSearchChoice'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { getSearchConfig } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'
import { type AskFormInputValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findFollowUp, getStepOptions } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const EMPTY_FOLLOW_UP: AskFormInputValues = { choice: null, selection: null, text: '' }

export type AskFormStepPath = `pages.${string}.${string}`

export type AskFormInputPath =
  | AskFormStepPath
  | `${AskFormStepPath}.followUp`
  | `${AskFormStepPath}.rows[${number}]`
  | `${AskFormStepPath}.rows[${number}].followUp`

type UnifiedAskFormInputProps = {
  form: UnifiedAskFormApi
  fields: AskFormInputPath
  /** Where the chosen option's follow-up is answered; omitted for a follow-up itself. */
  followUpFields?: AskFormInputPath
  taskId: string
  step: AskFormStepFields
  prompt: string | null
  onSelect?: (value: string) => void
}

/** A choice, search or text answer; the parts of a step that a follow-up or a sheet row can also hold. */
export const UnifiedAskFormInput = ({ form, fields, followUpFields, taskId, step, prompt, onSelect }: UnifiedAskFormInputProps) => {
  const { t } = useTranslation()
  const options = getStepOptions(step)
  const searchConfig = getSearchConfig(step)
  // Hooks can't be conditional, so without a follow-up path this binds to the step itself and is never used.
  const followUp = useFieldGroup({ form, fields: followUpFields ?? fields, defaultValues: EMPTY_FOLLOW_UP, formComponents: {} })

  if (options.length > 0 || searchConfig) {
    const choiceProps = {
      form,
      fields,
      label: t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.label.options', 'Options'),
      prompt,
      options: options.map(({ value, label }) => ({ value, label })),
      onSelect,
      onPickChange: followUpFields
        ? () => {
          followUp.setFieldValue('choice', null, { dontValidate: true })
          followUp.setFieldValue('selection', null, { dontValidate: true })
          followUp.setFieldValue('text', '')
        }
        : undefined,
      renderFollowUp: followUpFields
        ? (value: string) => {
          const followUpStep = findFollowUp(step, value)

          return followUpStep
            ? <UnifiedAskFormInput form={form} fields={followUpFields} taskId={taskId} step={followUpStep} prompt={followUpStep.prompt ?? null} />
            : null
        }
        : undefined,
    }

    return searchConfig
      ? <UnifiedAskFormSearchChoice {...choiceProps} taskId={taskId} config={searchConfig} />
      : <ChoiceStep {...choiceProps} />
  }

  const isText = step.type === AskFormStepType.Text

  return (
    <TextStep
      form={form}
      fields={fields}
      label={t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.label.answer', 'Answer')}
      prompt={prompt}
      placeholder={isText && step.placeholder
        ? step.placeholder
        : t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.placeholder.answer_in_your_words', 'Answer in your own words')}
      multiline={!isText || step.multiline}
    />
  )
}

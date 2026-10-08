import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { TextStep } from '@blocks/FormSteps/TextStep'
import { type AskFormStepFields, findOption, getStepOptions } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { useUnifiedAskFormSearch } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'

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
  const search = useUnifiedAskFormSearch(taskId, step)
  const options = getStepOptions(step)

  if (options.length > 0 || search) {
    return (
      <ChoiceStep
        form={form}
        fields={fields}
        label={t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.label.options', 'Options')}
        prompt={prompt}
        options={options.map(({ value, label }) => ({ value, label }))}
        search={search}
        onSelect={onSelect}
        renderFollowUp={followUpFields
          ? (choice) => {
            const followUp = findOption(step, choice)?.followUp

            return followUp
              ? <UnifiedAskFormInput form={form} fields={followUpFields} taskId={taskId} step={followUp} prompt={followUp.prompt ?? null} />
              : null
          }
          : undefined}
      />
    )
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

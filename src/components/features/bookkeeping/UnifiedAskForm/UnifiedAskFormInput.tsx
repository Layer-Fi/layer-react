import { useFieldGroup } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { TextStep } from '@blocks/FormSteps/TextStep'
import { UnifiedAskFormSearchChoice } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormSearchChoice'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { getSearchConfig } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'
import { type AskFormInputPath, type AskFormInputValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findFollowUp, getStepOptions } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const EMPTY_FOLLOW_UP: AskFormInputValues = { choice: null, selection: null, text: '' }

type UnifiedAskFormInputProps = {
  form: UnifiedAskFormApi
  fields: AskFormInputPath
  taskId: string
  step: AskFormStepFields
  prompt: string | null
  /** A follow-up has no follow-up of its own. */
  isFollowUp?: boolean
  onSelect?: (value: string) => void
}

/** A choice, search or text answer; the parts of a step that a follow-up or a sheet row can also hold. */
export const UnifiedAskFormInput = ({ form, fields, taskId, step, prompt, isFollowUp = false, onSelect }: UnifiedAskFormInputProps) => {
  const { t } = useTranslation()
  const followUpFields = `${fields}.followUp` as const
  // Hooks can't be conditional, so a follow-up binds this to its own fields and never uses it.
  const followUp = useFieldGroup({ form, fields: isFollowUp ? fields : followUpFields, defaultValues: EMPTY_FOLLOW_UP, formComponents: {} })

  const clearFollowUp = () => {
    followUp.setFieldValue('choice', null, { dontValidate: true })
    followUp.setFieldValue('selection', null, { dontValidate: true })
    followUp.setFieldValue('text', '')
  }

  const renderFollowUp = (value: string) => {
    const followUpStep = findFollowUp(step, value)

    return followUpStep
      ? <UnifiedAskFormInput form={form} fields={followUpFields} taskId={taskId} step={followUpStep} prompt={followUpStep.prompt ?? null} isFollowUp />
      : null
  }

  switch (step.type) {
    case AskFormStepType.Text:
      return (
        <TextStep
          form={form}
          fields={fields}
          label={t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.label.answer', 'Answer')}
          prompt={prompt}
          placeholder={step.placeholder ?? t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.placeholder.answer_in_your_words', 'Answer in your own words')}
          multiline={step.multiline}
        />
      )
    case AskFormStepType.Choice:
    case AskFormStepType.Category:
    case AskFormStepType.Search:
    case AskFormStepType.SearchWithFreeform: {
      const choiceProps = {
        form,
        fields,
        label: t('bookkeeping:UnifiedAskForm.UnifiedAskFormInput.label.options', 'Options'),
        prompt,
        options: getStepOptions(step),
        onSelect,
        onPickChange: isFollowUp ? undefined : clearFollowUp,
        renderFollowUp: isFollowUp ? undefined : renderFollowUp,
      }
      const searchConfig = getSearchConfig(step)

      return searchConfig
        ? <UnifiedAskFormSearchChoice {...choiceProps} taskId={taskId} config={searchConfig} />
        : <ChoiceStep {...choiceProps} />
    }
    default:
      return null
  }
}

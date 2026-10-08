import { useFieldGroup } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { P } from '@ui/Typography/Text'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { TextStep } from '@blocks/FormSteps/TextStep'
import { UnifiedAskFormSearchChoice } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormSearchChoice'
import { UnifiedAskFormUpload } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormUpload'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { getSearchConfig } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'
import { type AskFormInputPath, type AskFormInputValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'
import { type AskFormStepFields, findFollowUp, getStepOptions } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const EMPTY_FOLLOW_UP: AskFormInputValues = { choice: null, selection: null, text: '' }

export type UnifiedAskFormStepProps = {
  form: UnifiedAskFormApi
  fields: AskFormInputPath
  taskId: string
  step: AskFormStepFields
  prompt: string | null
  /** A follow-up has no follow-up of its own. */
  isFollowUp?: boolean
  onSelect?: (value: string) => void
}

/** Renders any step by its type; a page step, a follow-up and a sheet row all come through here. */
export const UnifiedAskFormStep = ({ form, fields, taskId, step, prompt, isFollowUp = false, onSelect }: UnifiedAskFormStepProps) => {
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
      ? <UnifiedAskFormStep form={form} fields={followUpFields} taskId={taskId} step={followUpStep} prompt={followUpStep.prompt ?? null} isFollowUp />
      : null
  }

  switch (step.type) {
    case AskFormStepType.Action:
      return prompt ? <P size='sm'>{prompt}</P> : null
    case AskFormStepType.Upload:
      return <UnifiedAskFormUpload form={form} fields={fields} taskId={taskId} prompt={prompt} accept={step.accept} multiple={step.multiple} />
    case AskFormStepType.Text:
      return (
        <TextStep
          form={form}
          fields={fields}
          label={t('bookkeeping:UnifiedAskForm.UnifiedAskFormStep.label.answer', 'Answer')}
          prompt={prompt}
          placeholder={step.placeholder ?? t('bookkeeping:UnifiedAskForm.UnifiedAskFormStep.placeholder.answer_in_your_words', 'Answer in your own words')}
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
        label: t('bookkeeping:UnifiedAskForm.UnifiedAskFormStep.label.options', 'Options'),
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
  }
}

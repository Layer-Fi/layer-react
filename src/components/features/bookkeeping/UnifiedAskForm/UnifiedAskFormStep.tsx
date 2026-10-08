import { type AskFormStep, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { UnifiedAskFormInput } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormInput'
import { UnifiedAskFormUpload } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormUpload'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'

export type UnifiedAskFormStepProps = {
  form: UnifiedAskFormApi
  pageId: string
  taskId: string
  step: AskFormStep
  prompt: string | null
  onSelect?: (value: string) => void
}

export const UnifiedAskFormStep = ({ form, pageId, taskId, step, prompt, onSelect }: UnifiedAskFormStepProps) => {
  const fields = `pages.${pageId}.${step.id}` as const

  switch (step.type) {
    case AskFormStepType.Action:
      return null
    case AskFormStepType.Upload:
      return <UnifiedAskFormUpload form={form} fields={fields} taskId={taskId} prompt={prompt} accept={step.accept} multiple={step.multiple} />
    default:
      return (
        <UnifiedAskFormInput
          form={form}
          fields={fields}
          followUpFields={`${fields}.followUp`}
          taskId={taskId}
          step={step}
          prompt={prompt}
          onSelect={onSelect}
        />
      )
  }
}

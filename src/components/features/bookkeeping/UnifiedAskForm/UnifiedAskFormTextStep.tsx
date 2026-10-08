import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

export type UnifiedAskFormTextStepValues = { text: string }

type UnifiedAskFormTextStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  placeholder?: string
  multiline?: boolean
  isDisabled?: boolean
}

const DEFAULT_VALUES: UnifiedAskFormTextStepValues = { text: '' }

const DEFAULT_PROPS: UnifiedAskFormTextStepProps = { label: '' }

export const UnifiedAskFormTextStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, placeholder, multiline, isDisabled }) {
    const accessibleLabel = prompt ?? label

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='text'>
          {field => (multiline
            ? <field.FormTextAreaField label={accessibleLabel} showLabel={false} placeholder={placeholder} isDisabled={isDisabled} />
            : <field.FormTextField label={accessibleLabel} showLabel={false} placeholder={placeholder} isDisabled={isDisabled} />)}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})

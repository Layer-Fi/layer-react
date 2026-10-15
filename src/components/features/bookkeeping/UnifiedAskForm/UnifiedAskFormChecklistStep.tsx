import { type AskFormChecklistItem } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

export type UnifiedAskFormChecklistStepValues = { checked: string[] }

type UnifiedAskFormChecklistStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  items: ReadonlyArray<AskFormChecklistItem>
  isDisabled?: boolean
}

const DEFAULT_VALUES: UnifiedAskFormChecklistStepValues = { checked: [] }

const DEFAULT_PROPS: UnifiedAskFormChecklistStepProps = { label: '', items: [] }

export const UnifiedAskFormChecklistStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, items, isDisabled }) {
    const options = items.map(item => ({ value: item.value, label: item.label }))

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='checked'>
          {field => <field.FormCheckboxGroupField label={prompt ?? label} showLabel={false} options={options} layout='row' isDisabled={isDisabled} />}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})

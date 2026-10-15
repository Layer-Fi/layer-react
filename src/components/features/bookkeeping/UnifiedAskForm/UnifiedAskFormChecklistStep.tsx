import {
  type AskFormChecklistItem,
  AskFormChecklistRequirement,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'
import { isChecklistItemRequired } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

export type UnifiedAskFormChecklistStepValues = { checked: string[] }

type UnifiedAskFormChecklistStepProps = {
  label: string
  prompt?: string | null
  items: ReadonlyArray<AskFormChecklistItem>
  require: AskFormChecklistRequirement
  isDisabled?: boolean
}

const DEFAULT_VALUES: UnifiedAskFormChecklistStepValues = { checked: [] }

const DEFAULT_PROPS: UnifiedAskFormChecklistStepProps = { label: '', items: [], require: AskFormChecklistRequirement.All }

export const UnifiedAskFormChecklistStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, items, require, isDisabled }) {
    const options = items.map(item => ({ value: item.value, label: item.label, isRequired: isChecklistItemRequired(require, item) }))
    const markOptional = require === AskFormChecklistRequirement.Items

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='checked'>
          {field => <field.FormCheckboxGroupField label={prompt ?? label} showLabel={false} options={options} layout='row' markOptional={markOptional} isDisabled={isDisabled} />}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})

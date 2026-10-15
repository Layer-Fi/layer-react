import {
  type AskFormChecklistItem,
  AskFormChecklistRequirement,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

export type UnifiedAskFormChecklistStepValues = { checked: string[] }

type UnifiedAskFormChecklistStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  items: ReadonlyArray<AskFormChecklistItem>
  require: AskFormChecklistRequirement
  isDisabled?: boolean
}

const DEFAULT_VALUES: UnifiedAskFormChecklistStepValues = { checked: [] }

const DEFAULT_PROPS: UnifiedAskFormChecklistStepProps = { label: '', items: [], require: AskFormChecklistRequirement.All }

// Only an ITEMS checklist mixes required and optional items, so only it tags the optional ones.
const toOption = (require: AskFormChecklistRequirement) => ({ value, label, required }: AskFormChecklistItem) => ({
  value,
  label,
  isRequired: require === AskFormChecklistRequirement.All || (require === AskFormChecklistRequirement.Items && required),
  isOptional: require === AskFormChecklistRequirement.Items && !required,
})

export const UnifiedAskFormChecklistStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, items, require, isDisabled }) {
    const options = items.map(toOption(require))

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='checked'>
          {field => <field.FormCheckboxGroupField label={prompt ?? label} showLabel={false} options={options} layout='row' isDisabled={isDisabled} />}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})

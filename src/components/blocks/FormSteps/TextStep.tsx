import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { withFieldGroup } from '@blocks/Form/useForm'

export type TextStepValues = { text: string }

type TextStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  placeholder?: string
  multiline?: boolean
  isDisabled?: boolean
}

const DEFAULT_VALUES: TextStepValues = { text: '' }

const DEFAULT_PROPS: TextStepProps = { label: '' }

export const TextStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, placeholder, multiline, isDisabled }) {
    const accessibleLabel = prompt ?? label

    return (
      <VStack gap='xs'>
        {prompt ? <P size='sm'>{prompt}</P> : null}
        <group.AppField name='text'>
          {field => (multiline
            ? <field.FormTextAreaField label={accessibleLabel} showLabel={false} placeholder={placeholder} isDisabled={isDisabled} />
            : <field.FormTextField label={accessibleLabel} showLabel={false} placeholder={placeholder} isDisabled={isDisabled} />)}
        </group.AppField>
      </VStack>
    )
  },
})

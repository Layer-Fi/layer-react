import { type ReactNode } from 'react'

import { type ChipSize } from '@ui/Chip/Chip'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { type ChipOption } from '@blocks/Form/FormChipGroupField'
import { type SearchComboBoxSelection } from '@blocks/Form/FormSearchComboBoxField'
import { withFieldGroup } from '@blocks/Form/useForm'

export type ChoiceStepValues = {
  choice: string | null
  selection: SearchComboBoxSelection | null
}

export type ChoiceStepSearch = {
  options: ReadonlyArray<ComboBoxOption>
  isLoading: boolean
  onSearchQueryChange: (query: string) => void
  placeholder?: string
  allowCreate?: boolean
  formatCreateLabel?: (text: string) => ReactNode
}

type ChoiceStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  options: ReadonlyArray<ChipOption<string>>
  size?: ChipSize
  search?: ChoiceStepSearch
  isDisabled?: boolean
  /** Fires for every chip press and search pick, including a repeat of the current answer. */
  onSelect?: (value: string) => void
  /** Rendered under the step for the current chip choice, such as that option's follow-up. */
  renderFollowUp?: (choice: string) => ReactNode
}

const DEFAULT_VALUES: ChoiceStepValues = { choice: null, selection: null }

const DEFAULT_PROPS: ChoiceStepProps = { label: '', options: [] }

/** Chips and an optional search over one answer; picking from one clears the other. */
export const ChoiceStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, options, size, search, isDisabled, onSelect, renderFollowUp }) {
    const accessibleLabel = prompt ?? label

    return (
      <VStack gap='xs'>
        {prompt ? <P size='sm'>{prompt}</P> : null}
        {options.length > 0
          ? (
            <group.AppField name='choice'>
              {field => (
                <field.FormChipGroupField
                  label={accessibleLabel}
                  showLabel={false}
                  size={size}
                  isDisabled={isDisabled}
                  options={[...options]}
                  onSelect={(value) => {
                    group.setFieldValue('selection', null)
                    onSelect?.(value)
                  }}
                />
              )}
            </group.AppField>
          )
          : null}
        {search
          ? (
            <group.AppField name='selection'>
              {field => (
                <field.FormSearchComboBoxField
                  {...search}
                  label={accessibleLabel}
                  showLabel={false}
                  isDisabled={isDisabled}
                  onSelect={(selection) => {
                    group.setFieldValue('choice', null)
                    onSelect?.(selection.value)
                  }}
                />
              )}
            </group.AppField>
          )
          : null}
        {renderFollowUp
          ? (
            <group.Subscribe selector={state => state.values.choice}>
              {choice => (choice ? renderFollowUp(choice) : null)}
            </group.Subscribe>
          )
          : null}
      </VStack>
    )
  },
})

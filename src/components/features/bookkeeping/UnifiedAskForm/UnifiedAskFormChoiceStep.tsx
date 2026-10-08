import { Fragment, type ReactNode } from 'react'
import { useStore } from '@tanstack/react-form'

import { asMutable } from '@utils/shared/array/asMutable'
import { getPickedValue } from '@utils/shared/form/pickedValue'
import { type ChipSize } from '@ui/Chip/Chip'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { type ChipOption } from '@blocks/Form/FormChipGroupField'
import { type SearchComboBoxSelection } from '@blocks/Form/FormSearchComboBoxField'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

export type UnifiedAskFormChoiceStepValues = {
  choice: string | null
  selection: SearchComboBoxSelection | null
}

export type UnifiedAskFormChoiceStepSearch = {
  options: ReadonlyArray<ComboBoxOption>
  isLoading: boolean
  isSearchError?: boolean
  searchErrorMessage?: string
  onSearchQueryChange: (query: string) => void
  placeholder?: string
  allowCreate?: boolean
  formatCreateLabel?: (text: string) => ReactNode
}

type UnifiedAskFormChoiceStepProps = {
  /** The accessible name; shown only when there is no prompt. */
  label: string
  prompt?: string | null
  options: ReadonlyArray<ChipOption<string>>
  size?: ChipSize
  search?: UnifiedAskFormChoiceStepSearch
  isDisabled?: boolean
  /** Fires for every chip press and search pick, including a repeat of the current answer. */
  onSelect?: (value: string) => void
  /** Fires when the picked value changes, such as to clear the previous option's follow-up. */
  onPickChange?: (value: string | null) => void
  /** Rendered under the step for the picked chip or search result, such as that option's follow-up. */
  renderFollowUp?: (value: string) => ReactNode
}

const DEFAULT_VALUES: UnifiedAskFormChoiceStepValues = { choice: null, selection: null }

const DEFAULT_PROPS: UnifiedAskFormChoiceStepProps = { label: '', options: [] }

/** Chips and an optional search over one answer; picking from one clears the other. */
export const UnifiedAskFormChoiceStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, label, prompt, options, size, search, isDisabled, onSelect, onPickChange, renderFollowUp }) {
    const accessibleLabel = prompt ?? label
    const pick = useStore(group.store, state => getPickedValue(state.values))

    const notifyPick = (value: string | null) => {
      if (value !== pick) onPickChange?.(value)
    }

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        {options.length > 0
          ? (
            <group.AppField name='choice'>
              {field => (
                <field.FormChipGroupField
                  label={accessibleLabel}
                  showLabel={false}
                  size={size}
                  isDisabled={isDisabled}
                  options={asMutable(options)}
                  onSelect={(value) => {
                    group.setFieldValue('selection', null)
                    notifyPick(value)
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
                    notifyPick(selection.isCreated ? null : selection.value)
                    onSelect?.(selection.value)
                  }}
                />
              )}
            </group.AppField>
          )
          : null}
        {renderFollowUp && pick ? <Fragment key={pick}>{renderFollowUp(pick)}</Fragment> : null}
      </UnifiedAskFormStepShell>
    )
  },
})

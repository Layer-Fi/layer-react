import { useId } from 'react'
import type { MultiValue, StylesConfig } from 'react-select'

import { type TagComparisonOption } from '@internal-types/profit_and_loss'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { MultiSelect } from '@components/Input/MultiSelect'

import './compareTagsMultiSelect.scss'

type SelectOption = { value: string, label: string }

const selectStyles = {
  valueContainer: (styles) => {
    return {
      ...styles,
      flexWrap: 'nowrap',
    }
  },
} satisfies StylesConfig<SelectOption, true>

type CompareTagsMultiSelectProps = {
  options: TagComparisonOption[]
  selectedOptions: TagComparisonOption[]
  onChange: (values: MultiValue<SelectOption>) => void
}

export const CompareTagsMultiSelect = ({
  options,
  selectedOptions,
  onChange,
}: CompareTagsMultiSelectProps) => {
  const inputId = useId()

  const selectOptions = options.map((tagComparisonOption) => {
    return {
      value: JSON.stringify(tagComparisonOption.tagFilterConfig),
      label: tagComparisonOption.displayName,
    }
  })

  return (
    <VStack className='Layer__CompareTagsMultiSelect__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>Compare by</Label>
      <MultiSelect
        inputId={inputId}
        options={selectOptions}
        onChange={onChange}
        defaultValue={selectedOptions?.map(option => ({
          value: JSON.stringify(option.tagFilterConfig),
          label: option.displayName,
        }))}
        value={selectedOptions.map((tagComparisonOption) => {
          return {
            value: JSON.stringify(tagComparisonOption.tagFilterConfig),
            label: tagComparisonOption.displayName,
          }
        })}
        placeholder='Select tags'
        styles={selectStyles}
        className='Layer__CompareTagsMultiSelect'
      />
    </VStack>
  )
}

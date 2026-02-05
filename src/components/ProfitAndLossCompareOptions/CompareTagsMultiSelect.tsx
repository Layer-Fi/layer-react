import { useContext, useId } from 'react'
import type { StylesConfig } from 'react-select'

import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
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

export const CompareTagsMultiSelect = () => {
  const {
    compareOptions,
    selectedCompareOptions,
    setSelectedCompareOptions,
  } = useContext(ProfitAndLossComparisonContext)

  const inputId = useId()

  const selectOptions = compareOptions.map((tagComparisonOption) => {
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
        onChange={setSelectedCompareOptions}
        defaultValue={selectedCompareOptions?.map(option => ({
          value: JSON.stringify(option.tagFilterConfig),
          label: option.displayName,
        }))}
        value={selectedCompareOptions.map((tagComparisonOption) => {
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

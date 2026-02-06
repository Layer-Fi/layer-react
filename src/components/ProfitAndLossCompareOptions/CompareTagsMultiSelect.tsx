import { useContext, useId } from 'react'
import type { StylesConfig } from 'react-select'

import { type TagComparisonOption } from '@internal-types/profit_and_loss'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { MultiSelect } from '@components/Input/MultiSelect'

import './compareTagsMultiSelect.scss'

type SelectOption = { value: string, label: string }

const toSelectOption = (opt: TagComparisonOption): SelectOption => ({
  value: JSON.stringify(opt.tagFilterConfig),
  label: opt.displayName,
})

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

  return (
    <VStack className='Layer__CompareTagsMultiSelect__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>Compare by</Label>
      <MultiSelect
        inputId={inputId}
        options={compareOptions.map(toSelectOption)}
        onChange={setSelectedCompareOptions}
        defaultValue={selectedCompareOptions?.map(toSelectOption)}
        value={selectedCompareOptions.map(toSelectOption)}
        placeholder='Select tags'
        styles={selectStyles}
        className='Layer__CompareTagsMultiSelect'
      />
    </VStack>
  )
}

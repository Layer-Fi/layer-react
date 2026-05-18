import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagControl } from '@schemas/reports/reportConfig'
import { isActiveTagValueDefinition, type TagValueDefinition } from '@schemas/tag'
import { useUnifiedReportTagSelection } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { MultiSelectComboBox } from '@ui/ComboBox/MultiSelectComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './unifiedReportTagControl.scss'

type UnifiedReportTagControlProps = {
  tagControl: TagControl
}

type UnifiedReportTagValueOption = {
  label: string
  value: string
  tagValueDefinition: TagValueDefinition
}

const toOption = (tagValueDefinition: TagValueDefinition): UnifiedReportTagValueOption => ({
  label: tagValueDefinition.displayName ?? tagValueDefinition.value,
  value: tagValueDefinition.value,
  tagValueDefinition,
})

export function UnifiedReportTagControl({ tagControl }: UnifiedReportTagControlProps) {
  const inputId = useId()
  const { t } = useTranslation()
  const { selectedTagValues, setSelectedTagValues } = useUnifiedReportTagSelection()
  const dimensionName = tagControl.tagDimension.displayName ?? tagControl.tagDimension.key
  const options = tagControl.tagDimension.definedValues.filter(isActiveTagValueDefinition).map(toOption)
  const selectedValues = selectedTagValues.filter(isActiveTagValueDefinition).map(toOption)

  const handleSelectedValuesChange = (values: ReadonlyArray<UnifiedReportTagValueOption>) => {
    setSelectedTagValues(values.map(({ tagValueDefinition }) => tagValueDefinition))
  }

  return (
    <VStack gap='3xs' className='Layer__UnifiedReports__TagControl__Container'>
      <Label size='sm' htmlFor={inputId}>
        {dimensionName}
      </Label>
      <MultiSelectComboBox<UnifiedReportTagValueOption>
        inputId={inputId}
        options={options}
        selectedValues={selectedValues}
        onSelectedValuesChange={handleSelectedValuesChange}
        placeholder={t('tags:action.select_dimension_name', 'Select {{dimensionName}}', { dimensionName })}
        isSearchable={selectedValues.length === 0}
      />
    </VStack>
  )
}

import { useCallback, useId, useMemo } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type Tag } from '@schemas/features/tags/tag'
import { type TagValueDefinition } from '@schemas/features/tags/tagValueDefinition'
import { useGetTagDimensionByKey } from '@api/businesses/[business-id]/tags/dimensions/key/[dimension-key]/get'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { FallbackWithSkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

type TagValueDefinitionAsOption = {
  id: string
  value: string
  label: string
  valueDisplayName: string | null | undefined
  archivedAt: Date | null | undefined
}

const toOption = (dv: TagValueDefinition, t: TFunction): TagValueDefinitionAsOption => {
  const baseLabel = dv.displayName ?? dv.value
  const label = dv.archivedAt
    ? t('tags:label.tag_label_archived', '{{label}} (Archived)', { label: baseLabel })
    : baseLabel

  return {
    id: dv.id,
    value: dv.value,
    label,
    valueDisplayName: dv.displayName,
    archivedAt: dv.archivedAt,
  }
}

type TagDimensionComboBoxProps = {
  dimensionKey: string
  value: Tag | null
  onValueChange: (tags: Tag | null) => void
  isReadOnly?: boolean
  showLabel?: boolean
  className?: string
  isClearable?: boolean
}

export const TagDimensionComboBox = ({
  dimensionKey,
  value,
  onValueChange,
  isReadOnly,
  showLabel,
  className,
  isClearable = true,
}: TagDimensionComboBoxProps) => {
  const { t } = useTranslation()
  const { data: tagDimension, isLoading } = useGetTagDimensionByKey({ dimensionKey })

  const options = useMemo(
    () => (tagDimension ? tagDimension.definedValues.map(dv => toOption(dv, t)) : []),
    [tagDimension, t],
  )

  const selectedOption = useMemo((): TagValueDefinitionAsOption | null => {
    if (value === null) return null
    return toOption({
      id: value.id,
      key: value.key,
      value: value.value,
      displayName: value.valueDisplayName,
      archivedAt: value.archivedAt,
    }, t)
  }, [value, t])

  const onSelectedValueChange = useCallback((option: TagValueDefinitionAsOption | null) => {
    let nextTag: Tag | null = null

    if (tagDimension && option) {
      nextTag = {
        id: option.id,
        key: tagDimension.key,
        dimensionDisplayName: tagDimension.displayName,
        value: option.value,
        valueDisplayName: option.valueDisplayName,
        archivedAt: option.archivedAt,
        _local: { isOptimistic: false },
      }
    }

    onValueChange(nextTag)
  }, [onValueChange, tagDimension])

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': tagDimension?.key }

  return (
    <div className={className}>
      <VStack gap='3xs'>
        {showLabel && (
          <FallbackWithSkeletonLoader isLoading={!tagDimension} height='1rem' width='8rem'>
            <Label size='sm' htmlFor={inputId}>
              {tagDimension?.key}
            </Label>
          </FallbackWithSkeletonLoader>
        )}
        <ComboBox
          options={options}
          onSelectedValueChange={onSelectedValueChange}
          selectedValue={selectedOption}
          inputId={inputId}
          isReadOnly={isReadOnly}
          isLoading={isLoading}
          placeholder={t('tags:action.select_dimension_name', 'Select {{dimensionName}}', { dimensionName: tagDimension?.displayName ?? dimensionKey })}
          isClearable={isClearable}
          {...additionalAriaProps}
        />
      </VStack>
    </div>
  )
}

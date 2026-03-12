import { useCallback, useId, useMemo } from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { type Tag, type TagValueDefinition } from '@schemas/tag'
import { useTagDimensionByKey } from '@hooks/api/businesses/[business-id]/tags/dimensions/key/[dimension-key]/useTagDimensionByKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { FallbackWithSkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

class TagValueDefinitionAsOption {
  private tagValueDefinition: TagValueDefinition

  constructor(tagValueDefinition: TagValueDefinition) {
    this.tagValueDefinition = tagValueDefinition
  }

  get id() {
    return this.tagValueDefinition.id
  }

  get label() {
    const label = (this.valueDisplayName ?? this.tagValueDefinition.value)
    if (this.isArchived) {
      return i18next.t('labelArchived', '{{label}} (Archived)', { label })
    }
    return label
  }

  get value() {
    return this.tagValueDefinition.value
  }

  get valueDisplayName() {
    return this.tagValueDefinition.displayName
  }

  get isArchived() {
    return !!this.archivedAt
  }

  get archivedAt() {
    return this.tagValueDefinition.archivedAt
  }
}

type TagDimensionComboboxProps = {
  dimensionKey: string
  value: Tag | null
  onValueChange: (tags: Tag | null) => void
  isReadOnly?: boolean
  showLabel?: boolean
  className?: string
  isClearable?: boolean
}

export const TagDimensionCombobox = ({
  dimensionKey,
  value,
  onValueChange,
  isReadOnly,
  showLabel,
  className,
  isClearable = true,
}: TagDimensionComboboxProps) => {
  const { t } = useTranslation()
  const { data: tagDimension, isLoading } = useTagDimensionByKey({ dimensionKey })

  const options = useMemo(() => {
    if (!tagDimension) return []

    return tagDimension.definedValues
      .map(value => new TagValueDefinitionAsOption(value))
  }, [tagDimension])

  const selectedOption = useMemo(() => {
    if (value === null) return null
    return new TagValueDefinitionAsOption({
      id: value.id,
      key: value.key,
      value: value.value,
      displayName: value.valueDisplayName,
      archivedAt: value.archivedAt,
    })
  }, [value])

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
      } as Tag
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
          placeholder={t('selectTagDimension', 'Select {{dimensionName}}', { dimensionName: tagDimension?.displayName ?? dimensionKey })}
          isClearable={isClearable}
          {...additionalAriaProps}
        />
      </VStack>
    </div>
  )
}

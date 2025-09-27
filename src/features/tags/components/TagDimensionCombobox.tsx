import { useCallback, useId, useMemo } from 'react'
import { ComboBox } from '../../../components/ui/ComboBox/ComboBox'
import { VStack } from '../../../components/ui/Stack/Stack'
import { Label } from '../../../components//ui/Typography/Text'
import { useTagDimensionByKey } from '../api/useTagDimensionByKey'
import { type TagValueDefinition, makeTag, type Tag } from '../tagSchemas'
import { FallbackWithSkeletonLoader } from '../../../components/SkeletonLoader/SkeletonLoader'

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
      return `${label} (Archived)`
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
}

export const TagDimensionCombobox = ({ dimensionKey, value, onValueChange, isReadOnly, showLabel }: TagDimensionComboboxProps) => {
  const { data: tagDimension, isLoading } = useTagDimensionByKey({ dimensionKey })

  const options = useMemo(() => {
    if (!tagDimension) return []

    return tagDimension.definedValues
      .map(value => new TagValueDefinitionAsOption(value))
  }, [tagDimension])

  const selectedOption = useMemo(() => {
    if (value === null) return null
    return new TagValueDefinitionAsOption({ id: value.id, value: value.value, displayName: value.valueLabel, archivedAt: value.archivedAt })
  }, [value])

  const onSelectedValueChange = useCallback((option: TagValueDefinitionAsOption | null) => {
    let nextTag: Tag | null = null

    if (tagDimension && option) {
      nextTag = makeTag({
        id: option.id,
        key: tagDimension.key,
        dimensionDisplayName: tagDimension.displayName,
        value: option.value,
        valueDisplayName: option.valueDisplayName,
        archivedAt: option.archivedAt,
        _local: { isOptimistic: false },
      })
    }

    onValueChange(nextTag)
  }, [onValueChange, tagDimension])

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': tagDimension?.key }
  return (
    <VStack gap='3xs'>
      {showLabel && (
        <FallbackWithSkeletonLoader isLoading={!tagDimension} height='1rem' width='5rem'>
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
        isClearable={false}
        {...additionalAriaProps}
      />
    </VStack>
  )
}

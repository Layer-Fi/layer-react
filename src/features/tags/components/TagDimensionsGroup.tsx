import { TagDimensionCombobox } from '@features/tags/components/TagDimensionCombobox'
import { Tag } from '@features/tags/tagSchemas'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import './tagDimensionsGroup.scss'
import { HStack } from '@ui/Stack/Stack'

const TAG_DIMENSIONS_GROUP_CSS_PREFIX = 'Layer__TagDimensionsGroup'

export interface TagDimensionsGroupProps {
  value: readonly Tag[]
  onChange: (tags: readonly Tag[]) => void
  showLabels?: boolean
  isReadOnly?: boolean
  isEnabled?: boolean
  className?: string
}

export const TagDimensionsGroup = ({
  value,
  onChange,
  showLabels = false,
  isReadOnly = false,
  isEnabled = true,
  className,
}: TagDimensionsGroupProps) => {
  const { accountingConfiguration } = useLayerContext()

  const handleTagValueChange = (dimensionKey: string) => (newTag: Tag | null) => {
    const filteredTags = value.filter(tag =>
      tag.key.toLowerCase() !== dimensionKey.toLowerCase(),
    )

    const updatedTags = newTag ? [...filteredTags, newTag] : filteredTags

    onChange(updatedTags)
  }

  const getSelectedTagForDimension = (dimensionKey: string): Tag | null => {
    return value.find(tag =>
      tag.key.toLowerCase() === dimensionKey.toLowerCase(),
    ) ?? null
  }

  if (!isEnabled || accountingConfiguration?.platformDisplayTags.length === 0) {
    return null
  }

  return (
    <HStack gap='xs' className={className}>
      {(accountingConfiguration?.platformDisplayTags ?? []).map(dimension => (
        <TagDimensionCombobox
          key={dimension.key}
          dimensionKey={dimension.key}
          isReadOnly={isReadOnly}
          value={getSelectedTagForDimension(dimension.key)}
          onValueChange={handleTagValueChange(dimension.key)}
          showLabel={showLabels}
          className={`${TAG_DIMENSIONS_GROUP_CSS_PREFIX}__TagComboBox`}
        />
      ))}
    </HStack>
  )
}

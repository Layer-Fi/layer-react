import { TagDimensionCombobox } from '../../../features/tags/components/TagDimensionCombobox'
import { Tag } from '../../../features/tags/tagSchemas'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface TagDimensionsGroupProps {
  dimensionKeys?: string[]
  value: readonly Tag[]
  onChange: (tags: readonly Tag[]) => void
  showLabels?: boolean
  isReadOnly?: boolean
}

export const TagDimensionsGroup = ({
  dimensionKeys = [],
  value,
  onChange,
  showLabels = false,
  isReadOnly = false,
}: TagDimensionsGroupProps) => {
  const handleDimensionChange = (dimensionKey: string) => (newTag: Tag | null) => {
    // Filter out any existing tags for this dimension
    const filteredTags = value.filter(tag =>
      tag.dimensionLabel.toLowerCase() !== dimensionKey.toLowerCase(),
    )

    // Add the new tag if it exists, otherwise just use filtered tags
    const updatedTags = newTag ? [...filteredTags, newTag] : filteredTags

    onChange(updatedTags)
  }

  const getSelectedTagForDimension = (dimensionKey: string): Tag | null => {
    return value.find(tag =>
      tag.dimensionLabel.toLowerCase() === dimensionKey.toLowerCase(),
    ) ?? null
  }

  return (
    <>
      {dimensionKeys.map(dimensionKey => (
        <TagDimensionCombobox
          key={dimensionKey}
          dimensionKey={dimensionKey}
          isReadOnly={isReadOnly}
          value={getSelectedTagForDimension(dimensionKey)}
          onValueChange={handleDimensionChange(dimensionKey)}
          showLabel={showLabels}
          className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--tag`}
        />
      ))}
    </>
  )
}

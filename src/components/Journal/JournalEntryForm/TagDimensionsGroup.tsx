import { TagDimensionCombobox } from '../../../features/tags/components/TagDimensionCombobox'
import { Tag } from '../../../features/tags/tagSchemas'
import { useAvailableTagDimensions } from '../../../features/tags/api/useAvailableTagDimensions'
import { FallbackWithSkeletonLoader } from '../../../components/SkeletonLoader/SkeletonLoader'

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
  const { availableDimensions, isLoading, isError } = useAvailableTagDimensions({
    desiredDimensionKeys: dimensionKeys,
  })

  const handleTagValueChange = (dimensionKey: string) => (newTag: Tag | null) => {
    const filteredTags = value.filter(tag =>
      tag.dimensionLabel.toLowerCase() !== dimensionKey.toLowerCase(),
    )

    const updatedTags = newTag ? [...filteredTags, newTag] : filteredTags

    onChange(updatedTags)
  }

  const getSelectedTagForDimension = (dimensionKey: string): Tag | null => {
    return value.find(tag =>
      tag.dimensionLabel.toLowerCase() === dimensionKey.toLowerCase(),
    ) ?? null
  }

  /* Optimistically render skeleton loaders for each desired dimension while fetching */
  if (isLoading) {
    return (
      <>
        {dimensionKeys.map(dimensionKey => (
          <div
            key={dimensionKey}
            className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--tag`}
            style={{ minWidth: '12rem' }}
          >
            <FallbackWithSkeletonLoader isLoading={true} height='2.5rem' width='100%' />
          </div>
        ))}
      </>
    )
  }

  if (isError) {
    return null
  }

  return (
    <>
      {availableDimensions.map(dimension => (
        <TagDimensionCombobox
          key={dimension.key}
          dimensionKey={dimension.key}
          isReadOnly={isReadOnly}
          value={getSelectedTagForDimension(dimension.key)}
          onValueChange={handleTagValueChange(dimension.key)}
          showLabel={showLabels}
          className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--tag`}
        />
      ))}
    </>
  )
}

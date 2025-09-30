import { TagDimensionCombobox } from '../../../features/tags/components/TagDimensionCombobox'
import { Tag } from '../../../features/tags/tagSchemas'
import { FallbackWithSkeletonLoader } from '../../../components/SkeletonLoader/SkeletonLoader'
import { useTagDimensions } from '../../../features/tags/api/useTagDimensions'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface TagDimensionsGroupProps {
  value: readonly Tag[]
  onChange: (tags: readonly Tag[]) => void
  showLabels?: boolean
  isReadOnly?: boolean
  isEnabled?: boolean
}

export const TagDimensionsGroup = ({
  value,
  onChange,
  showLabels = false,
  isReadOnly = false,
  isEnabled = true,
}: TagDimensionsGroupProps) => {
  const { data: tagDimensions, isLoading, isError } = useTagDimensions({ isEnabled })

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

  if (!isEnabled) {
    return null
  }

  if (isLoading) {
    return (
      <>
        <div
          key='loader'
          className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--tag`}
          style={{ minWidth: '12rem' }}
        >
          <FallbackWithSkeletonLoader isLoading={true} height='2.5rem' width='100%' />
        </div>
      </>
    )
  }

  if (isError) {
    return null
  }

  return (
    <>
      {(tagDimensions ?? []).map(dimension => (
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

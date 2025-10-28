import {
  useCallback,
  useId,
  useMemo,
  type PropsWithChildren,
} from 'react'
import { Label, Span } from '../../../components/ui/Typography/Text'
import { useTagDimensions } from '../api/useTagDimensions'
import { VStack } from '../../../components/ui/Stack/Stack'
import { Button } from '../../../components/ui/Button/Button'
import { X } from 'lucide-react'
import { Tag, TagGroup, TagList } from '../../../components/ui/TagGroup/TagGroup'
import { useFlattenedTagValues } from '../useFlattenedTagValues'
import type { OneOf } from '../../../types/utility/oneOf'
import { LoadingSpinner } from '../../../components/ui/Loading/LoadingSpinner'
import { Square } from '../../../components/ui/Square/Square'
import { Group } from 'react-aria-components'
import { ComboBox } from '../../../components/ui/ComboBox/ComboBox'
import { getDimensionDisplayName, getTagDisplayNameForDimension, getTagDisplayNameForValue, getTagValueDisplayName, type Tag as TagType, type TagValue } from '../tagSchemas'
import './tagSelector.scss'

const TAG_SELECTOR_CLASS_NAMES = {
  LAYOUT_GROUP: 'Layer__TagSelectorLayoutGroup',
} as const

function TagSelectorLayoutGroup({ children }: PropsWithChildren) {
  return (
    <Group className={TAG_SELECTOR_CLASS_NAMES.LAYOUT_GROUP}>
      {children}
    </Group>
  )
}

type CommonTagSelectorSelectionProps = { selectedTags: ReadonlyArray<TagType> }
type TagSelectorSelectionProps = OneOf<
  [
    { onRemoveTag: (tag: TagType) => void } & CommonTagSelectorSelectionProps,
    { isReadOnly: true } & CommonTagSelectorSelectionProps,
  ]
>

function TagSelectorSelection({
  selectedTags,
  onRemoveTag,
  isReadOnly,
}: TagSelectorSelectionProps) {
  if (selectedTags.length === 0) {
    return null
  }

  return (
    <TagGroup
      aria-label='Active Tags'
      selectionMode='none'
      onRemove={
        onRemoveTag
          ? (keys) => {
            keys.forEach((key) => {
              if (typeof key !== 'string') {
                return
              }

              const tagToRemove = selectedTags.find(({ id }) => id === key)

              if (tagToRemove) {
                onRemoveTag(tagToRemove)
              }
            })
          }
          : undefined
      }
    >
      <TagList
        items={selectedTags}
        columnCount={isReadOnly ? 2 : undefined}
      >
        {(tag) => {
          const isOptimistic = tag._local?.isOptimistic ?? false
          const dimensionLabel = getTagDisplayNameForDimension(tag)
          const valueLabel = getTagDisplayNameForValue(tag)
          const id = tag.id

          return (
            <Tag key={id} id={id} textValue={`${dimensionLabel}: ${valueLabel}`}>
              <Span
                slot='dimension'
                variant='subtle'
                nonAria
              >
                {dimensionLabel}
                :
              </Span>
              <Span
                slot='value'
                ellipsis
                nonAria
              >
                {valueLabel}
              </Span>
              {isReadOnly
                ? null
                : (
                  isOptimistic
                    ? (
                      <Square inset>
                        <LoadingSpinner size={16} />
                      </Square>
                    )
                    : (
                      <Button
                        slot='remove'
                        icon
                        inset
                        variant='ghost'
                      >
                        <X size={16} />
                      </Button>
                    )
                )}
            </Tag>
          )
        }}
      </TagList>
    </TagGroup>
  )
}

type LabeledTagSelectorContainerProps = PropsWithChildren<{
  forInputId?: string
}>

function LabeledTagSelectorContainer({
  children,
  forInputId,
}: LabeledTagSelectorContainerProps) {
  return (
    <VStack gap='3xs'>
      <Label
        htmlFor={forInputId}
        size='sm'
      >
        Tags
      </Label>
      {children}
    </VStack>
  )
}

type TagSelectorProps = {
  selectedTags: ReadonlyArray<TagType>
  onAddTag: (tagValue: TagValue) => void
  onRemoveTag: (tag: TagType) => void

  isReadOnly?: boolean
}

export function TagSelector({
  selectedTags,
  onAddTag,
  onRemoveTag,
  isReadOnly,
}: TagSelectorProps) {
  const { data, isLoading, isError } = useTagDimensions()

  const groups = useMemo(
    () => data
      ?.map((tag) => {
        const { key, definedValues } = tag
        const dimensionLabel = getDimensionDisplayName(tag)
        return {
          label: dimensionLabel,
          options: definedValues.map((tag) => {
            const { id: valueId, value: value } = tag
            const valueLabel = getTagValueDisplayName(tag)
            return ({
              label: valueLabel,
              value: valueId,
              isDisabled: selectedTags.some(
                tagValue =>
                  tagValue.key === key
                  && tagValue.value === value,
              ),
            })
          }),
        }
      }) ?? [],
    [
      data,
      selectedTags,
    ],
  )

  const flattenedTagValues = useFlattenedTagValues(data)

  const handleSelectedValueChange = useCallback(
    (selectedValue: { value: string } | null) => {
      if (selectedValue === null) {
        return
      }

      const { value: valueId } = selectedValue
      const tagValue = flattenedTagValues.find(({ valueId: id }) => id === valueId)

      if (tagValue === undefined) {
        return
      }

      onAddTag(tagValue)
    },
    [
      flattenedTagValues,
      onAddTag,
    ],
  )

  const inputId = useId()

  const EmptyMessage = useMemo(
    () => (
      <Span
        variant='subtle'
        nonAria
      >
        No matching tags found
      </Span>
    ),
    [],
  )
  const ErrorMessage = useMemo(
    () => (
      <Span
        size='xs'
        status='error'
        nonAria
      >
        An error occurred while loading tag options.
      </Span>
    ),
    [],
  )

  const noDimensionsExist = !isLoading
    && data !== undefined
    && data.length === 0

  const shouldHideComponent = noDimensionsExist || (isReadOnly && selectedTags.length === 0)

  if (shouldHideComponent) {
    /*
     * If there are zero dimensions, the selector is pointless. This behavior will change
     * when we support adding a tag.
     */
    return null
  }

  if (isReadOnly) {
    return (
      <LabeledTagSelectorContainer>
        <TagSelectorSelection
          isReadOnly
          selectedTags={selectedTags}
        />
      </LabeledTagSelectorContainer>
    )
  }

  const shouldDisableComboBox = isLoading || isError

  return (
    <LabeledTagSelectorContainer forInputId={inputId}>
      <TagSelectorLayoutGroup>
        <ComboBox
          selectedValue={null}
          onSelectedValueChange={handleSelectedValueChange}

          groups={groups}
          inputId={inputId}

          placeholder='Add a tag to this transaction...'
          slots={{
            EmptyMessage,
            ErrorMessage,
          }}

          isDisabled={shouldDisableComboBox}
          isError={isError}
          isLoading={isLoading}

          displayDisabledAsSelected
        />
        <TagSelectorSelection
          selectedTags={selectedTags}
          onRemoveTag={onRemoveTag}
        />
      </TagSelectorLayoutGroup>
    </LabeledTagSelectorContainer>
  )
}

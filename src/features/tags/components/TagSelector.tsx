import {
  type PropsWithChildren,
  useCallback,
  useId,
  useMemo,
} from 'react'
import { X } from 'lucide-react'
import { Group } from 'react-aria-components'

import type { OneOf } from '@internal-types/utility/oneOf'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { Square } from '@ui/Square/Square'
import { VStack } from '@ui/Stack/Stack'
import { Tag, TagGroup, TagList } from '@ui/TagGroup/TagGroup'
import { Label, Span } from '@ui/Typography/Text'
import { useTagDimensions } from '@features/tags/api/useTagDimensions'
import { getDimensionDisplayName, getTagDisplayNameForDimension, getTagDisplayNameForValue, getTagValueDisplayName, type Tag as TagType, type TagValue } from '@features/tags/tagSchemas'
import { useFlattenedTagValues } from '@features/tags/useFlattenedTagValues'

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

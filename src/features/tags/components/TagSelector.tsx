import {
  useId,
  useMemo,
  type PropsWithChildren,
} from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { ListBox, ListBoxItem, ListBoxSection, ListBoxSectionHeader } from '../../../components/ui/ListBox/ListBox'
import { Popover } from '../../../components/ui/Popover/Popover'
import { Label, P, Span } from '../../../components/ui/Typography/Text'
import { useTagDimensions } from '../api/useTagDimensions'
import { Collection, ComboBox, Group } from 'react-aria-components'
import { VStack } from '../../../components/ui/Stack/Stack'
import { Button } from '../../../components/ui/Button/Button'
import ChevronDown from '../../../icons/ChevronDown'
import { Tag, TagGroup, TagList } from '../../../components/ui/TagGroup/TagGroup'
import X from '../../../icons/X'
import { Schema } from 'effect'
import { useFlattenedTagValues } from '../useFlattenedTagValues'
import type { OneOf } from '../../../types/utility/oneOf'

const TAG_SELECTOR_CLASS_NAMES = {
  INPUT_GROUP: 'Layer__TagSelectorInputGroup',
  LAYOUT_GROUP: 'Layer__TagSelectorLayoutGroup',
} as const

function TagSelectorLayoutGroup({ children }: PropsWithChildren) {
  return (
    <Group className={TAG_SELECTOR_CLASS_NAMES.LAYOUT_GROUP}>
      {children}
    </Group>
  )
}

function TagSelectorInputGroup({ children }: PropsWithChildren) {
  return (
    <Group className={TAG_SELECTOR_CLASS_NAMES.INPUT_GROUP}>
      {children}
    </Group>
  )
}

const TagValueSchema = Schema.Data(
  Schema.Struct({
    dimensionId: Schema.UUID,
    dimensionLabel: Schema.NonEmptyTrimmedString,
    valueId: Schema.UUID,
    valueLabel: Schema.NonEmptyTrimmedString,
  }),
)
export const makeTagValue = Schema.decodeSync(TagValueSchema)
export type TagValue = typeof TagValueSchema.Type

const TagSchema = Schema.Data(
  Schema.Struct({
    id: Schema.UUID,
    dimensionLabel: Schema.NonEmptyTrimmedString,
    valueLabel: Schema.NonEmptyTrimmedString,
  }),
)
export const makeTag = Schema.decodeSync(TagSchema)
export type Tag = typeof TagSchema.Type

type CommonTagSelectorSelectionProps = { selectedTags: ReadonlyArray<Tag> }
type TagSelectorSelectionProps = OneOf<
  [
    { onRemoveTag: (tag: Tag) => void } & CommonTagSelectorSelectionProps,
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
        {({
          id,
          dimensionLabel,
          valueLabel,
        }) => (
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
              weight='bold'
              ellipsis
              size='lg'
              nonAria
            >
              {valueLabel}
            </Span>
            {isReadOnly
              ? null
              : (
                <Button
                  slot='remove'
                  icon
                  variant='ghost'
                  size='sm'
                >
                  <X />
                </Button>
              )}
          </Tag>
        )}
      </TagList>
    </TagGroup>
  )
}

type LabeledTagSelectorContainerProps = PropsWithChildren<{
  labelId: string
}>

function LabeledTagSelectorContainer({
  children,
  labelId,
}: LabeledTagSelectorContainerProps) {
  return (
    <VStack gap='3xs'>
      <Label
        id={labelId}
        size='sm'
      >
        Tags
      </Label>
      {children}
    </VStack>
  )
}

type TagSelectorProps = {
  selectedTags: ReadonlyArray<Tag>
  isReadOnly?: boolean
  onAddTag: (tagValue: TagValue) => void
  onRemoveTag: (tag: Tag) => void
}

export function TagSelector({
  selectedTags,
  isReadOnly,
  onAddTag,
  onRemoveTag,
}: TagSelectorProps) {
  const { data, isLoading, isError } = useTagDimensions()
  const flattenedTagValues = useFlattenedTagValues(data)

  const disabledTagValueIds = useMemo(
    () => flattenedTagValues
      .filter(({ dimensionLabel, valueLabel }) => {
        const match = selectedTags.find(selectedTag =>
          selectedTag.dimensionLabel === dimensionLabel
          && selectedTag.valueLabel === valueLabel,
        )

        return match !== undefined
      })
      .map(({ valueId }) => valueId),
    [
      flattenedTagValues,
      selectedTags,
    ],
  )

  const handleAddTag = (valueId: string) => {
    const tagValue = flattenedTagValues.find(({ valueId: id }) => id === valueId)

    if (tagValue === undefined) {
      return
    }

    onAddTag(tagValue)
  }

  const labelId = useId()

  type TItemDerived = Exclude<typeof data, undefined> extends ReadonlyArray<infer TItem>
    ? TItem
    : never

  const shouldHideComponent = !isLoading
    && data !== undefined
    && data.length === 0

  if (shouldHideComponent) {
    /*
     * If there are zero dimensions, the selector is pointless. This behavior will change
     * when we support adding a tag.
     */
    return null
  }

  if (isReadOnly) {
    return (
      <LabeledTagSelectorContainer
        labelId={labelId}
      >
        <TagSelectorSelection
          isReadOnly
          selectedTags={selectedTags}
        />
      </LabeledTagSelectorContainer>
    )
  }

  const shouldDisableComboBox = isLoading || isError

  return (
    <LabeledTagSelectorContainer labelId={labelId}>
      <TagSelectorLayoutGroup>
        <ComboBox
          defaultItems={data ?? []}
          allowsEmptyCollection
          menuTrigger='focus'
          aria-labelledby={labelId}
          isDisabled={shouldDisableComboBox}
          selectedKey={null}
          onSelectionChange={(selectedKey) => {
            if (selectedKey === null || typeof selectedKey !== 'string') {
              return
            }

            handleAddTag(selectedKey)
          }}
          disabledKeys={disabledTagValueIds}
        >
          <TagSelectorInputGroup>
            <Input
              placeholder='Add a tag to this transaction...'
              placement='first-within-group'
            />
            <Button icon variant='ghost' isPending={isLoading}>
              <ChevronDown />
            </Button>
          </TagSelectorInputGroup>
          {isError
            ? (
              <P
                slot='errorMessage'
                pbs='3xs'
                size='xs'
                status='error'
              >
                An error occurred while loading tag options.
              </P>
            )
            : null}
          <Popover
            /*
             * This is necessary until a bug in `react-aria-components` is fixed
             *
             * @see {https://github.com/adobe/react-spectrum/pull/7742}
             */
            shouldFlip={false}
            placement='bottom start'
            crossOffset={-2}
          >
            <ListBox<TItemDerived>
              renderEmptyState={() => (
                <VStack pi='xs' pb='sm'>
                  <P
                    variant='subtle'
                    nonAria
                  >
                    No matching tags found.
                  </P>
                </VStack>
              )}
            >
              {({
                id: definitionId,
                key: definitionLabel,
                definedValues,
              }) => (
                <ListBoxSection key={definitionId}>
                  <ListBoxSectionHeader
                    pb='2xs'
                    size='sm'
                  >
                    {definitionLabel}
                  </ListBoxSectionHeader>
                  <Collection items={definedValues}>
                    {({
                      id: valueId,
                      value: valueLabel,
                    }) => (
                      <ListBoxItem
                        key={valueId}
                        id={valueId}
                        textValue={`${definitionLabel} ${valueLabel}`}
                      >
                        <Span slot='label' weight='bold'>{valueLabel}</Span>
                      </ListBoxItem>
                    )}
                  </Collection>
                </ListBoxSection>
              )}
            </ListBox>
          </Popover>
        </ComboBox>
        <TagSelectorSelection
          selectedTags={selectedTags}
          onRemoveTag={onRemoveTag}
        />
      </TagSelectorLayoutGroup>
    </LabeledTagSelectorContainer>
  )
}

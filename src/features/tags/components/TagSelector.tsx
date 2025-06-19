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
import { HStack, VStack } from '../../../components/ui/Stack/Stack'
import { Button } from '../../../components/ui/Button/Button'
import { X, ChevronDown } from 'lucide-react'
import { Tag, TagGroup, TagList } from '../../../components/ui/TagGroup/TagGroup'
import { Schema } from 'effect'
import { useFlattenedTagValues } from '../useFlattenedTagValues'
import type { OneOf } from '../../../types/utility/oneOf'
import { LoadingSpinner } from '../../../components/ui/Loading/LoadingSpinner'
import { Square } from '../../../components/ui/Square/Square'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { Check } from 'lucide-react'

const TAG_SELECTOR_CLASS_NAMES = {
  LAYOUT_GROUP: 'Layer__TagSelectorLayoutGroup',
  CHECK_ICON: 'Layer__TagSelectorCheckIcon',
} as const

function TagSelectorLayoutGroup({ children }: PropsWithChildren) {
  return (
    <Group className={TAG_SELECTOR_CLASS_NAMES.LAYOUT_GROUP}>
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
    _local: Schema.Struct({
      isOptimistic: Schema.Boolean,
    }),
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
          _local,
        }) => {
          const isOptimistic = _local?.isOptimistic ?? false

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

    /*
     * Even though we correctly supply `disabledKeys` to the ComboBox, it still allows
     * pressing `Enter` on the same option multiple times.
     */
    const existingSelectedOption = selectedTags.find(
      ({ dimensionLabel, valueLabel }) =>
        tagValue.dimensionLabel === dimensionLabel
        && tagValue.valueLabel === valueLabel,
    )
    if (existingSelectedOption) {
      return
    }

    onAddTag(tagValue)
  }

  const labelId = useId()

  type TItemDerived = Exclude<typeof data, undefined> extends ReadonlyArray<infer TItem>
    ? TItem
    : never

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
          <InputGroup>
            <Input
              inset
              placeholder='Add a tag to this transaction...'
              placement='first'
            />
            <Button icon inset variant='ghost' isPending={isLoading}>
              <ChevronDown size={16} />
            </Button>
          </InputGroup>
          {isError
            ? (
              <HStack justify='end'>
                <P
                  slot='errorMessage'
                  pbs='3xs'
                  size='xs'
                  status='error'
                >
                  An error occurred while loading tag options.
                </P>
              </HStack>
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
            crossOffset={-10}
            offset={10}
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
                        <HStack gap='2xs'>
                          <Check size={16} className={TAG_SELECTOR_CLASS_NAMES.CHECK_ICON} />
                          <Span slot='label' weight='bold'>{valueLabel}</Span>
                        </HStack>
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

import { type ComponentProps, useMemo, useRef } from 'react'
import classNames from 'classnames'
import {
  type ClearIndicatorProps,
  components,
  type DropdownIndicatorProps,
  type GroupBase,
  type GroupHeadingProps,
  type LoadingIndicatorProps,
  type NoticeProps,
  type OptionProps,
  type PlaceholderProps,
  type SingleValueProps,
} from 'react-select'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import Check from '@icons/Check'
import ChevronDown from '@icons/ChevronDown'
import X from '@icons/X'
import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import type { ComboBoxOption, ComboBoxSlots } from '@ui/ComboBox/types'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack } from '@ui/Stack/Stack'
import { Header, Span } from '@ui/Typography/Text'

type UseComboBoxSubcomponentsParams<T extends ComboBoxOption> = {
  placeholder?: string
  slots?: ComboBoxSlots<T>
  displayDisabledAsSelected?: boolean
}

function buildCustomClearIndicator<T extends ComboBoxOption>() {
  return function CustomClearIndicator({
    children,
    ...restProps
  }: ClearIndicatorProps<T, false, GroupBase<T>>) {
    return (
      <components.ClearIndicator {...restProps} className={COMBO_BOX_CLASS_NAMES.CLEAR_INDICATOR}>
        <X size={16} />
      </components.ClearIndicator>
    )
  }
}

function buildCustomDropdownIndicator<T extends ComboBoxOption>() {
  return function CustomDropdownIndicator({
    children,
    ...restProps
  }: DropdownIndicatorProps<T, false, GroupBase<T>>) {
    const { isDisabled } = restProps

    return (
      <components.DropdownIndicator
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.DROPDOWN_INDICATOR}
      >
        {!isDisabled ? <ChevronDown size={16} /> : <></>}
      </components.DropdownIndicator>
    )
  }
}

function buildCustomLoadingIndicator<T extends ComboBoxOption>() {
  return function CustomLoadingIndicator(
    _props: LoadingIndicatorProps<T, false, GroupBase<T>>,
  ) {
    return (
      <div className={COMBO_BOX_CLASS_NAMES.LOADING_INDICATOR}>
        <LoadingSpinner size={16} />
      </div>
    )
  }
}

function buildCustomMenuPortal<T extends ComboBoxOption>() {
  return function CustomMenuPortal({
    children,
    ...restProps
  }: ComponentProps<typeof components.MenuPortal<T, false, GroupBase<T>>>) {
    const dataProperties = toDataProperties({ 'react-aria-top-layer': true })

    return (
      <components.MenuPortal
        {...restProps}
        // We need to pass data-react-aria-top-layer to ensure that this is never made inert by
        // react-aria-components if the ModalOverlay is on screen. We should approach this in a
        // better way when this PR is merged: https://github.com/adobe/react-spectrum/pull/8796
        // @ts-expect-error - see above
        innerProps={dataProperties}
      >
        {children}
      </components.MenuPortal>
    )
  }
}

type BuildCustomGroupHeadingParams<T extends ComboBoxOption> = {
  GroupHeading: ComboBoxSlots<T>['GroupHeading']
}

function buildCustomGroupHeading<T extends ComboBoxOption>({
  GroupHeading,
}: BuildCustomGroupHeadingParams<T>) {
  return function CustomGroupHeading({
    children,
    ...restProps
  }: GroupHeadingProps<T, false, GroupBase<T>>) {
    const defaultRenderedGroupHeading = (
      <Header size='xs' variant='subtle'>
        {children}
      </Header>
    )

    const content = GroupHeading
      ? <GroupHeading group={restProps.data} fallback={defaultRenderedGroupHeading} />
      : defaultRenderedGroupHeading

    return (
      <components.GroupHeading
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.GROUP_HEADING}
      >
        {content}
      </components.GroupHeading>
    )
  }
}

type BuildCustomNoOptionsMessageParams = {
  EmptyMessage: ComboBoxSlots<ComboBoxOption>['EmptyMessage']
}

function buildCustomNoOptionsMessage<T extends ComboBoxOption>({
  EmptyMessage,
}: BuildCustomNoOptionsMessageParams) {
  return function CustomNoOptionsMessage({
    children,
    ...restProps
  }: NoticeProps<T, false, GroupBase<T>>) {
    return (
      <components.NoOptionsMessage
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.NO_OPTIONS_MESSAGE}
      >
        {EmptyMessage ?? <Span>No matching options</Span>}
      </components.NoOptionsMessage>
    )
  }
}

type BuildCustomOptionParams<T extends ComboBoxOption> = {
  displayDisabledAsSelected?: boolean
  Option: ComboBoxSlots<T>['Option']
}

function buildCustomOption<T extends ComboBoxOption>({
  displayDisabledAsSelected,
  Option,
}: BuildCustomOptionParams<T>) {
  return function CustomOption({
    children,
    ...restProps
  }: OptionProps<T, false, GroupBase<T>>) {
    const { isSelected, isFocused, isDisabled } = restProps

    const effectiveIsSelected = isSelected || (displayDisabledAsSelected && isDisabled)

    const defaultRenderedOption = (
      <HStack gap='xs' align='center'>
        <Check size={16} className={COMBO_BOX_CLASS_NAMES.OPTION_CHECK_ICON} />
        <Span variant='inherit'>{children}</Span>
      </HStack>
    )

    return (
      <components.Option
        {...restProps}
        className={classNames(
          COMBO_BOX_CLASS_NAMES.OPTION,
          isFocused ? `${COMBO_BOX_CLASS_NAMES.OPTION}--focused` : undefined,
          effectiveIsSelected ? `${COMBO_BOX_CLASS_NAMES.OPTION}--selected` : undefined,
          isDisabled ? `${COMBO_BOX_CLASS_NAMES.OPTION}--disabled` : undefined,
          restProps.data.isHidden ? `${COMBO_BOX_CLASS_NAMES.OPTION}--hidden` : undefined,
        )}
      >
        {Option
          ? <Option option={restProps.data} fallback={defaultRenderedOption} />
          : defaultRenderedOption}
      </components.Option>
    )
  }
}

type BuildCustomPlaceholderParams = {
  placeholder?: string
}

function buildCustomPlaceholder<T extends ComboBoxOption>({
  placeholder,
}: BuildCustomPlaceholderParams) {
  return function CustomPlaceholder({
    children,
    ...restProps
  }: PlaceholderProps<T, false, GroupBase<T>>) {
    if (!placeholder) return null

    return (
      <components.Placeholder {...restProps} className={COMBO_BOX_CLASS_NAMES.PLACEHOLDER}>
        <Span variant='placeholder' ellipsis>{placeholder}</Span>
      </components.Placeholder>
    )
  }
}

type BuildCustomSingleValueParams = {
  SelectedValue: ComboBoxSlots<ComboBoxOption>['SelectedValue']
}

function buildCustomSingleValue<T extends ComboBoxOption>({
  SelectedValue,
}: BuildCustomSingleValueParams) {
  return function CustomSingleValue({
    children,
    ...restProps
  }: SingleValueProps<T, false, GroupBase<T>>) {
    return (
      <components.SingleValue {...restProps}>
        {SelectedValue ?? children}
      </components.SingleValue>
    )
  }
}

export function useComboBoxSubcomponents<T extends ComboBoxOption>({
  placeholder,
  slots,
  displayDisabledAsSelected,
}: UseComboBoxSubcomponentsParams<T>) {
  const { EmptyMessage, SelectedValue, GroupHeading, Option } = slots ?? {}

  const ClearIndicatorRef = useRef(buildCustomClearIndicator<T>())
  const DropdownIndicatorRef = useRef(buildCustomDropdownIndicator<T>())
  const LoadingIndicatorRef = useRef(buildCustomLoadingIndicator<T>())
  const MenuPortalRef = useRef(buildCustomMenuPortal<T>())

  const GroupHeadingComponent = useMemo(
    () => buildCustomGroupHeading<T>({ GroupHeading }),
    [GroupHeading],
  )

  const NoOptionsMessageComponent = useMemo(
    () => buildCustomNoOptionsMessage<T>({ EmptyMessage }),
    [EmptyMessage],
  )

  const OptionComponent = useMemo(
    () => buildCustomOption<T>({ displayDisabledAsSelected, Option }),
    [displayDisabledAsSelected, Option],
  )

  const PlaceholderComponent = useMemo(
    () => buildCustomPlaceholder<T>({ placeholder }),
    [placeholder],
  )

  const SingleValueComponent = useMemo(
    () => buildCustomSingleValue<T>({ SelectedValue }),
    [SelectedValue],
  )

  return useMemo(() => ({
    ClearIndicator: ClearIndicatorRef.current,
    DropdownIndicator: DropdownIndicatorRef.current,
    GroupHeading: GroupHeadingComponent,
    LoadingIndicator: LoadingIndicatorRef.current,
    MenuPortal: MenuPortalRef.current,
    NoOptionsMessage: NoOptionsMessageComponent,
    Option: OptionComponent,
    Placeholder: PlaceholderComponent,
    SingleValue: SingleValueComponent,
  }), [
    GroupHeadingComponent,
    NoOptionsMessageComponent,
    OptionComponent,
    PlaceholderComponent,
    SingleValueComponent,
  ])
}

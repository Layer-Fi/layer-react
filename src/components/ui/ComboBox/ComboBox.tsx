import Select, {
  components,
  type OptionProps,
  type GroupBase,
  type GroupHeadingProps,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type LoadingIndicatorProps,
  type PlaceholderProps,
  type NoticeProps,
  type SingleValueProps,
} from 'react-select'
import { HStack, VStack } from '../Stack/Stack'
import { Header, P, Span } from '../Typography/Text'
import { useId, useMemo, useRef, type ComponentProps, type ReactNode } from 'react'
import type { OneOf } from '../../../types/utility/oneOf'
import classNames from 'classnames'
import { PORTAL_CLASS_NAME } from '../Portal/Portal'
import Check from '../../../icons/Check'
import { ChevronDown, Lock, X } from 'lucide-react'
import { LoadingSpinner } from '../Loading/LoadingSpinner'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './comboBox.scss'

const COMBO_BOX_CLASS_NAMES = {
  CONTAINER: 'Layer__ComboBoxContainer',

  CONTROL: 'Layer__ComboBoxControl',
  VALUE_CONTAINER: 'Layer__ComboBoxValueContainer',
  PLACEHOLDER: 'Layer__ComboBoxPlaceholder',

  INDICATORS_CONTAINER: 'Layer__ComboBoxIndicatorsContainer',

  MENU: classNames(
    PORTAL_CLASS_NAME,
    'Layer__ComboBoxMenu',
  ),
  MENU_LIST: 'Layer__ComboBoxMenuList',

  GROUP: 'Layer__ComboBoxGroup',
  GROUP_HEADING: 'Layer__ComboBoxGroupHeading',

  OPTION: 'Layer__ComboBoxOption',
  OPTION_CHECK_ICON: 'Layer__ComboBoxOptionCheckIcon',

  NO_OPTIONS_MESSAGE: 'Layer__ComboBoxNoOptionsMessage',

  CLEAR_INDICATOR: 'Layer__ComboBoxClearIndicator',
  LOADING_INDICATOR: 'Layer__ComboBoxLoadingIndicator',
  DROPDOWN_INDICATOR: 'Layer__ComboBoxDropdownIndicator',
}

type ComboBoxOption = {
  label: string
  value: string
  isDisabled?: boolean
}

function buildCustomGroupHeading() {
  return function CustomGroupHeading<T extends ComboBoxOption>({
    children,
    ...restProps
  }: GroupHeadingProps<T, false, GroupBase<T>>) {
    return (
      <components.GroupHeading
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.GROUP_HEADING}
      >
        <Header size='xs'>
          {children}
        </Header>
      </components.GroupHeading>
    )
  }
}

type BuildCustomComboBoxOptionParameters = {
  displayDisabledAsSelected?: boolean
}

function buildCustomComboBoxOption({
  displayDisabledAsSelected,
}: BuildCustomComboBoxOptionParameters) {
  return function CustomComboBoxOption<T extends ComboBoxOption>({
    children,
    ...restProps
  }: OptionProps<T, false, GroupBase<T>>) {
    const { isSelected, isFocused, isDisabled } = restProps

    const effectiveIsSelected = isSelected || (displayDisabledAsSelected && isDisabled)

    return (
      <components.Option
        {...restProps}
        className={classNames(
          COMBO_BOX_CLASS_NAMES.OPTION,
          isFocused ? `${COMBO_BOX_CLASS_NAMES.OPTION}--focused` : undefined,
          effectiveIsSelected ? `${COMBO_BOX_CLASS_NAMES.OPTION}--selected` : undefined,
          isDisabled ? `${COMBO_BOX_CLASS_NAMES.OPTION}--disabled` : undefined,
        )}
      >

        <Check size={16} className={COMBO_BOX_CLASS_NAMES.OPTION_CHECK_ICON} />
        <Span weight='bold'>
          {children}
        </Span>
      </components.Option>
    )
  }
}

function buildCustomClearIndicator() {
  return function CustomClearIndicator<T extends ComboBoxOption>({
    children,
    ...restProps
  }: ClearIndicatorProps<T, false, GroupBase<T>>) {
    return (
      <components.ClearIndicator
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.CLEAR_INDICATOR}
      >
        <X size={16} />
      </components.ClearIndicator>
    )
  }
}

function buildCustomLoadingIndicator() {
  return function CustomLoadingIndicator<T extends ComboBoxOption>(
    _props: LoadingIndicatorProps<T, false, GroupBase<T>>,
  ) {
    return (
      <div className={COMBO_BOX_CLASS_NAMES.LOADING_INDICATOR}>
        <LoadingSpinner size={16} />
      </div>
    )
  }
}

function buildCustomDropdownIndicator() {
  return function CustomDropdownIndicator<T extends ComboBoxOption>({
    children,
    ...restProps
  }: DropdownIndicatorProps<T, false, GroupBase<T>>) {
    const { isDisabled } = restProps

    return (
      <components.DropdownIndicator
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.DROPDOWN_INDICATOR}
      >
        {isDisabled ? <Lock size={16} /> : <ChevronDown size={16} /> }
      </components.DropdownIndicator>
    )
  }
}

type BuildCustomNoOptionsMessageProps = {
  EmptyMessage?: ReactNode
}

function buildCustomNoOptionsMessage({ EmptyMessage }: BuildCustomNoOptionsMessageProps) {
  return function CustomNoOptionsMessage<T extends ComboBoxOption>({
    children,
    ...restProps
  }: NoticeProps<T, false, GroupBase<T>>) {
    return (
      <components.NoOptionsMessage
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.NO_OPTIONS_MESSAGE}
      >
        {EmptyMessage
          ?? (
            <Span weight='bold'>
              No matching options
            </Span>
          )}
      </components.NoOptionsMessage>
    )
  }
}

function buildCustomPlaceholder({ placeholder }: { placeholder?: string }) {
  return function CustomPlaceholder<T extends ComboBoxOption>({
    children,
    ...restProps
  }: PlaceholderProps<T, false, GroupBase<T>>) {
    if (!placeholder) return null

    return (
      <components.Placeholder
        {...restProps}
        className={COMBO_BOX_CLASS_NAMES.PLACEHOLDER}
      >
        <Span variant='placeholder' ellipsis>{placeholder}</Span>
      </components.Placeholder>
    )
  }
}

function buildCustomSingleValue({ SelectedValue }: { SelectedValue: ReactNode }) {
  return function CustomSingleValue<T extends ComboBoxOption>({
    children,
    ...restProps
  }: SingleValueProps<T, false, GroupBase<T>>) {
    return (
      <components.SingleValue
        {...restProps}
      >
        {SelectedValue ?? children}
      </components.SingleValue>
    )
  }
}

function buildCustomMenuPortal() {
  return function CustomMenu<T extends ComboBoxOption>({
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

type OptionsOrGroups<T> = OneOf<[
  { options: ReadonlyArray<T> },
  { groups: ReadonlyArray<{ label: string, options: ReadonlyArray<T> }> },
]>

type AriaLabelProps = Pick<
  React.AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby'
>

type ComboBoxProps<T extends ComboBoxOption> = {
  className?: string

  selectedValue: T | null
  onSelectedValueChange: (value: T | null) => void

  onInputValueChange?: (value: string) => void

  placeholder?: string
  slots?: {
    EmptyMessage?: ReactNode
    ErrorMessage?: ReactNode
    SelectedValue?: ReactNode
  }

  inputId?: string

  isDisabled?: boolean
  isError?: boolean
  isLoading?: boolean
  isMutating?: boolean

  isSearchable?: boolean
  isClearable?: boolean
  isReadOnly?: boolean

  displayDisabledAsSelected?: boolean
} & OptionsOrGroups<T> & AriaLabelProps

export function ComboBox<T extends ComboBoxOption>({
  className,

  selectedValue,
  onSelectedValueChange,

  options,
  groups,

  onInputValueChange,

  placeholder,
  slots,

  inputId,

  isDisabled,
  isError,
  isLoading,
  isMutating,

  isSearchable = true,
  isClearable = true,
  isReadOnly = false,

  displayDisabledAsSelected,

  ...ariaProps
}: ComboBoxProps<T>) {
  const internalInputId = useId()
  const effectiveInputId = inputId ?? internalInputId

  const CustomGroupHeadingRef = useRef(buildCustomGroupHeading())
  const CustomComboBoxOption = useMemo(
    () => (buildCustomComboBoxOption({ displayDisabledAsSelected })),
    [displayDisabledAsSelected],
  )

  const { EmptyMessage, ErrorMessage, SelectedValue } = slots ?? {}

  const CustomNoOptionsMessage = useMemo(
    () => buildCustomNoOptionsMessage({ EmptyMessage }),
    [EmptyMessage],
  )
  const CustomPlaceholder = useMemo(
    () => buildCustomPlaceholder({ placeholder }),
    [placeholder],
  )

  const CustomSingleValue = useMemo(
    () => buildCustomSingleValue({ SelectedValue }),
    [SelectedValue],
  )

  const CustomMenuPortalRef = useRef(buildCustomMenuPortal())

  const CustomClearIndicatorRef = useRef(buildCustomClearIndicator())
  const CustomLoadingIndicatorRef = useRef(buildCustomLoadingIndicator())
  const CustomDropdownIndicatorRef = useRef(buildCustomDropdownIndicator())

  return (
    <VStack gap='3xs'>
      <Select
        inputId={effectiveInputId}
        {...ariaProps}

        value={selectedValue}
        onChange={onSelectedValueChange}

        options={options ?? groups}

        onInputChange={onInputValueChange}
        escapeClearsValue

        menuPortalTarget={document.body}

        placeholder={placeholder}

        unstyled
        className={className}
        classNames={{
          container: () => COMBO_BOX_CLASS_NAMES.CONTAINER,
          control: ({ isFocused, isDisabled }) => classNames(
            COMBO_BOX_CLASS_NAMES.CONTROL,
            isFocused && `${COMBO_BOX_CLASS_NAMES.CONTROL}--focused`,
            isDisabled && `${COMBO_BOX_CLASS_NAMES.CONTROL}--disabled`,
            isReadOnly && `${COMBO_BOX_CLASS_NAMES.CONTROL}--readonly`,
          ),
          valueContainer: () => COMBO_BOX_CLASS_NAMES.VALUE_CONTAINER,
          placeholder: () => COMBO_BOX_CLASS_NAMES.PLACEHOLDER,

          indicatorsContainer: () => classNames(
            COMBO_BOX_CLASS_NAMES.INDICATORS_CONTAINER,
            isReadOnly && `${COMBO_BOX_CLASS_NAMES.INDICATORS_CONTAINER}--readonly`,
          ),

          menu: () => COMBO_BOX_CLASS_NAMES.MENU,
          menuList: () => COMBO_BOX_CLASS_NAMES.MENU_LIST,

          group: () => COMBO_BOX_CLASS_NAMES.GROUP,
        }}

        styles={{
          // Ensure the menu portal appears stacked above modals
          menuPortal: base => ({ ...base, zIndex: 101 }),
        }}

        components={{
          GroupHeading: CustomGroupHeadingRef.current,
          Option: CustomComboBoxOption,

          Placeholder: CustomPlaceholder,
          NoOptionsMessage: CustomNoOptionsMessage,

          ClearIndicator: CustomClearIndicatorRef.current,
          LoadingIndicator: CustomLoadingIndicatorRef.current,
          DropdownIndicator: CustomDropdownIndicatorRef.current,

          SingleValue: CustomSingleValue,
          MenuPortal: CustomMenuPortalRef.current,
        }}
        isClearable={isClearable && !isReadOnly}
        isDisabled={isDisabled}
        isLoading={isLoading || isMutating}
        isSearchable={isSearchable && !isReadOnly}
        openMenuOnClick={!isReadOnly}
      />
      {isError
        ? (
          <HStack justify='end'>
            {ErrorMessage ?? (
              <P
                size='xs'
                status='error'
              >
                An error occurred.
              </P>
            )}
          </HStack>
        )
        : null}
    </VStack>
  )
}

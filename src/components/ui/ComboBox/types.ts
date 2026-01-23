import type { ReactNode } from 'react'
import type { GroupBase, MenuPlacement } from 'react-select'

import type { OneOf } from '@internal-types/utility/oneOf'

export type ComboBoxOption = {
  label: string
  value: string
  isDisabled?: boolean
  isHidden?: boolean
}

export type OptionsOrGroups<T extends ComboBoxOption> = OneOf<[
  { options: ReadonlyArray<T> },
  { groups: ReadonlyArray<{ label: string, options: ReadonlyArray<T> }> },
]>

export type AriaLabelProps = Pick<
  React.AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby'
>

export type ComboBoxSlots<T extends ComboBoxOption> = {
  EmptyMessage?: ReactNode
  ErrorMessage?: ReactNode
  GroupHeading?: React.FC<{ group: GroupBase<T>, fallback: ReactNode }>
  Option?: React.FC<{ option: T, fallback: ReactNode }>
  SelectedValue?: ReactNode
}

export type BaseComboBoxProps<T extends ComboBoxOption> = {
  className?: string

  selectedValue: T | null
  onSelectedValueChange: (value: T | null) => void

  onInputValueChange?: (value: string) => void

  placeholder?: string
  slots?: ComboBoxSlots<T>

  inputId?: string

  isDisabled?: boolean
  isError?: boolean
  isLoading?: boolean
  isMutating?: boolean

  isSearchable?: boolean
  isClearable?: boolean
  isReadOnly?: boolean

  displayDisabledAsSelected?: boolean

  menuPlacement?: MenuPlacement
} & OptionsOrGroups<T> & AriaLabelProps

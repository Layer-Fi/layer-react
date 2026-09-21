import { type ForwardedRef, forwardRef } from 'react'
import {
  ToggleButton as ReactAriaToggleButton,
  type ToggleButtonProps as ReactAriaToggleButtonProps,
} from 'react-aria-components/ToggleButton'
import {
  ToggleButtonGroup as ReactAriaToggleButtonGroup,
  type ToggleButtonGroupProps as ReactAriaToggleButtonGroupProps,
} from 'react-aria-components/ToggleButtonGroup'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './chip.scss'

const CHIP_GROUP_CLASS_NAME = 'Layer__UI__ChipGroup'
const CHIP_CLASS_NAME = 'Layer__UI__Chip'

type ChipGroupProps<T extends string> = Pick<ReactAriaToggleButtonGroupProps, 'children' | 'isDisabled'> & {
  ariaLabel: string
  value?: T | null
  onChange?: (value: T) => void
}

function ChipGroupWithRef<T extends string>(
  { ariaLabel, children, value, onChange, ...restProps }: ChipGroupProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <ReactAriaToggleButtonGroup
      {...restProps}
      aria-label={ariaLabel}
      selectionMode='single'
      disallowEmptySelection
      selectedKeys={value == null ? [] : [value]}
      onSelectionChange={(keys) => {
        const [next] = keys

        if (next !== undefined) onChange?.(next as T)
      }}
      className={CHIP_GROUP_CLASS_NAME}
      ref={ref}
    >
      {children}
    </ReactAriaToggleButtonGroup>
  )
}

export const ChipGroup = forwardRef(ChipGroupWithRef) as <T extends string>(
  props: ChipGroupProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => React.ReactElement

export type ChipSize = 'sm' | 'md' | 'lg'

// A toggle button rather than a radio so `onPress` also fires on the chip already selected.
type ChipProps<T extends string> = Pick<ReactAriaToggleButtonProps, 'children' | 'onPress'> & {
  size?: ChipSize
  value: T
}

function ChipWithRef<T extends string>(
  { children, size = 'md', value, ...restProps }: ChipProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const dataProperties = toDataProperties({ size })

  return (
    <ReactAriaToggleButton
      {...restProps}
      {...dataProperties}
      id={value}
      className={CHIP_CLASS_NAME}
      ref={ref}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaToggleButton>
  )
}

export const Chip = forwardRef(ChipWithRef) as <T extends string>(
  props: ChipProps<T> & { ref?: ForwardedRef<HTMLButtonElement> },
) => React.ReactElement

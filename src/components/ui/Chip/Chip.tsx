import { type ForwardedRef, forwardRef } from 'react'
import { ChevronRight } from 'lucide-react'
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

export type ChipVariant = 'pill' | 'row'

type ChipGroupProps<T extends string> = Pick<ReactAriaToggleButtonGroupProps, 'children' | 'isDisabled'> & {
  ariaLabel: string
  variant?: ChipVariant
  value?: T | null
  onChange?: (value: T) => void
}

function ChipGroupWithRef<T extends string>(
  { ariaLabel, children, value, onChange, variant = 'pill', ...restProps }: ChipGroupProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const dataProperties = toDataProperties({ variant })

  return (
    <ReactAriaToggleButtonGroup
      {...restProps}
      {...dataProperties}
      aria-label={ariaLabel}
      orientation={variant === 'row' ? 'vertical' : 'horizontal'}
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
  variant?: ChipVariant
  value: T
}

function ChipWithRef<T extends string>(
  { children, size = 'md', variant = 'pill', value, ...restProps }: ChipProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const dataProperties = toDataProperties({ size, variant })

  return (
    <ReactAriaToggleButton
      {...restProps}
      {...dataProperties}
      id={value}
      className={CHIP_CLASS_NAME}
      ref={ref}
    >
      {withRenderProp(children, node => (variant === 'row'
        ? (
          <>
            {node}
            <ChevronRight size={16} aria-hidden />
          </>
        )
        : node))}
    </ReactAriaToggleButton>
  )
}

export const Chip = forwardRef(ChipWithRef) as <T extends string>(
  props: ChipProps<T> & { ref?: ForwardedRef<HTMLButtonElement> },
) => React.ReactElement

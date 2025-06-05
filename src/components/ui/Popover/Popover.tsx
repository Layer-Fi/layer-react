import { forwardRef } from 'react'
import {
  Popover as ReactAriaPopover,
  PopoverProps as ReactAriaPopoverProps,
} from 'react-aria-components'

const POPOVER_CLASS_NAME = 'Layer__Popover'
const POPOVER_CLASS_NAMES = `Layer__Portal ${POPOVER_CLASS_NAME}`

type PopoverProps = Omit<ReactAriaPopoverProps, 'className'>

export const Popover = forwardRef<HTMLElement, PopoverProps>(
  function Popover(props, ref) {
    return (
      <ReactAriaPopover
        {...props}
        className={POPOVER_CLASS_NAMES}
        ref={ref}
      />
    )
  },
)

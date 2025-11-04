import { forwardRef } from 'react'
import {
  Popover as ReactAriaPopover,
  PopoverProps as ReactAriaPopoverProps,
} from 'react-aria-components'
import classNames from 'classnames'
import './popover.scss'

const POPOVER_CLASS_NAME = 'Layer__Popover'
const POPOVER_CLASS_NAMES = `Layer__Portal ${POPOVER_CLASS_NAME}`

type PopoverProps = ReactAriaPopoverProps

export const Popover = forwardRef<HTMLElement, PopoverProps>(
  function Popover({ className, ...restProps }, ref) {
    return (
      <ReactAriaPopover
        {...restProps}
        className={classNames(POPOVER_CLASS_NAMES, className)}
        ref={ref}
      />
    )
  },
)

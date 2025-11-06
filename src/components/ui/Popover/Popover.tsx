import { forwardRef } from 'react'
import {
  Popover as ReactAriaPopover,
  PopoverProps as ReactAriaPopoverProps,
} from 'react-aria-components'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import './popover.scss'

const POPOVER_CLASS_NAME = 'Layer__Popover'
const POPOVER_CLASS_NAMES = `Layer__Portal ${POPOVER_CLASS_NAME}`

type PopoverProps = Omit<ReactAriaPopoverProps, 'className'> & {
  flexInline?: boolean
}

export const Popover = forwardRef<HTMLElement, PopoverProps>(
  function Popover({ flexInline = false, ...restProps }, ref) {
    const dataProperties = toDataProperties({ 'flex-inline': flexInline })

    return (
      <ReactAriaPopover
        {...restProps}
        {...dataProperties}
        className={POPOVER_CLASS_NAMES}
        ref={ref}
      />
    )
  },
)

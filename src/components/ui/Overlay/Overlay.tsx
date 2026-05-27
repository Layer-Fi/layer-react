import { type ReactNode, useCallback, useState } from 'react'
import { Dialog, DialogTrigger } from 'react-aria-components/Dialog'

import { Popover, type PopoverProps } from '@ui/Popover/Popover'

import './overlay.scss'

export type OverlayRenderArgs = {
  close: () => void
}

export type OverlayProps = {
  children: ReactNode | ((args: OverlayRenderArgs) => ReactNode)
  slots: {
    Trigger: ReactNode | ((args: { isOpen: boolean }) => ReactNode)
  }
  slotProps?: {
    Popover?: PopoverProps
    Dialog?: {
      width?: number | string
    }
  }
}

export function Overlay({ children, slots, slotProps }: OverlayProps) {
  const trigger = slots.Trigger

  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      <Popover {...slotProps?.Popover}>
        <Dialog className='Layer__Overlay__Dialog' style={{ width: slotProps?.Dialog?.width }}>
          {typeof children === 'function' ? children({ close }) : children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

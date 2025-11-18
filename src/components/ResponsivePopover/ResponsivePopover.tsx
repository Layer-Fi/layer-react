import { type PropsWithChildren, type RefObject } from 'react'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Modal } from '@ui/Modal/Modal'
import { Popover } from '@ui/Popover/Popover'

type ResponsivePopoverProps = PropsWithChildren<{
  triggerRef?: RefObject<HTMLElement>
}>

export function ResponsivePopover({ children, triggerRef }: ResponsivePopoverProps) {
  const { isMobile } = useSizeClass()

  if (isMobile) {
    return (
      <Modal
        flexBlock
        flexInline
        variant='mobile-popover'
        isDismissable
      >
        {children}
      </Modal>
    )
  }

  return (
    <Popover
      triggerRef={triggerRef}
      placement='bottom left'
      flexInline
    >
      {children}
    </Popover>
  )
}

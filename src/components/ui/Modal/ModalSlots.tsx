import React, { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import { Heading } from '../Typography/Heading'
import { P } from '../Typography/Text'

const MODAL_CONTEXT_BAR_CLASS_NAME = 'Layer__ModalContextBar'

type ModalContextBarProps = {
  onClose?: () => void
}

function ModalContextBar({ onClose }: ModalContextBarProps) {
  return (
    <div className={MODAL_CONTEXT_BAR_CLASS_NAME}>
      <Button
        icon
        variant='ghost'
        slot='close'
        onPress={onClose}
        aria-label='Close Modal'
      >
        <X />
      </Button>
    </div>
  )
}


const ModalHeading = forwardRef<
  HTMLHeadingElement,
  Omit<ComponentProps<typeof Heading>, 'level' | 'slot'>
>((props, ref) =>
  <Heading
    {...props}
    slot='title'
    level={2}
    ref={ref}
  />
)
ModalHeading.displayName = 'ModalHeading'

const ModalDescription = forwardRef<
  HTMLParagraphElement,
  Omit<ComponentProps<typeof P>, 'slot'>
>((props, ref) =>
  <P
    {...props}
    slot='description'
    ref={ref}
  />
)
ModalDescription.displayName = 'ModalDescription'


const MODAL_CONTENT_CLASS_NAME = 'Layer__ModalContent'

function ModalContent({ children }: PropsWithChildren) {
  return <div className={MODAL_CONTENT_CLASS_NAME}>{children}</div>
}

const MODAL_ACTIONS_CLASS_NAME = 'Layer__ModalActions'

function ModalActions({ children }: PropsWithChildren) {
  return (
    <div className={MODAL_ACTIONS_CLASS_NAME}>
      {children}
    </div>
  )
}

export {
  ModalContextBar,
  ModalHeading,
  ModalDescription,
  ModalContent,
  ModalActions,
}

import { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import { Heading } from '../Typography/Heading'
import { P } from '../Typography/Text'

const MODAL_CONTEXT_BAR_CLASS_NAME = 'Layer__ModalContextBar'

type ModalCloseButtonProps = {
  onClose?: () => void
}

export const ModalCloseButton = ({ onClose }: ModalCloseButtonProps) => (
  <Button
    icon
    size='sm'
    variant='ghost'
    slot='close'
    onPress={onClose}
    aria-label='Close Modal'
  >
    <X size={24} />
  </Button>
)

type ModalContextBarProps = ModalCloseButtonProps
export function ModalContextBar({ onClose }: ModalContextBarProps) {
  return (
    <div className={MODAL_CONTEXT_BAR_CLASS_NAME}>
      <ModalCloseButton onClose={onClose} />
    </div>
  )
}

export const ModalHeading = forwardRef<
  HTMLHeadingElement,
  Omit<ComponentProps<typeof Heading>, 'level' | 'slot'>
>(function ModalHeading(props, ref) {
  return (
    <Heading
      {...props}
      slot='title'
      level={2}
      ref={ref}
    />
  )
})

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  Omit<ComponentProps<typeof P>, 'slot'>
>(function ModalDescription(props, ref) {
  return (
    <P
      {...props}
      slot='description'
      ref={ref}
    />
  )
})

const MODAL_CONTENT_CLASS_NAME = 'Layer__ModalContent'

export function ModalContent({ children }: PropsWithChildren) {
  return <div className={MODAL_CONTENT_CLASS_NAME}>{children}</div>
}

const MODAL_ACTIONS_CLASS_NAME = 'Layer__ModalActions'

export function ModalActions({ children }: PropsWithChildren) {
  return (
    <div className={MODAL_ACTIONS_CLASS_NAME}>
      {children}
    </div>
  )
}

import { forwardRef, type ComponentProps, type PropsWithChildren, type ReactElement } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import { Heading } from '../Typography/Heading'
import { P } from '../Typography/Text'
import classNames from 'classnames'

const MODAL_CLOSE_BUTTON_CLASS_NAME = 'Layer__ModalCloseButton'

type ModalCloseButtonProps = {
  onClose?: () => void
  positionAbsolute?: boolean
}

export const ModalCloseButton = ({ onClose, positionAbsolute = false }: ModalCloseButtonProps) => (
  <div
    className={
      classNames(MODAL_CLOSE_BUTTON_CLASS_NAME,
        positionAbsolute && `${MODAL_CLOSE_BUTTON_CLASS_NAME}--position-absolute`,
      )
    }
  >
    <Button
      icon
      inset
      variant='ghost'
      slot='close'
      onPress={onClose}
      aria-label='Close Modal'
    >
      <X size={24} />
    </Button>
  </div>
)

type ModalTitleWithCloseProps = {
  heading: ReactElement
  onClose?: () => void
}

export const ModalTitleWithClose = forwardRef<
  HTMLElementTagNameMap['div'],
  ModalTitleWithCloseProps
>(function ModalTitleWithClose({ heading, onClose }, ref) {
  return (
    <div
      className='Layer__ModalTitleWithClose'
      ref={ref}
    >
      {heading}
      <Button
        icon
        inset
        variant='ghost'
        slot='close'
        onPress={onClose}
        aria-label='Close Modal'
      >
        <X size={16} />
      </Button>
    </div>
  )
})

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

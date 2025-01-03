import React, { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'

const MODAL_OVERLAY_CLASS_NAME = 'Layer__ModalOverlay'
const MODAL_OVERLAY_CLASS_NAMES = `Layer__Portal ${MODAL_OVERLAY_CLASS_NAME}`

const ModalOverlay = forwardRef<
  HTMLElementTagNameMap['div'],
  Omit<ModalOverlayProps, 'className'>
>((props, ref) =>
  <ReactAriaModalOverlay
    {...props}
    className={MODAL_OVERLAY_CLASS_NAMES}
    ref={ref}
  />
)
ModalOverlay.displayName = 'ModalOverlay'

const MODAL_CLASS_NAME = 'Layer__Modal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  PropsWithChildren
>(({ children }, ref) =>
  <ReactAriaModal
    className={MODAL_CLASS_NAME}
    ref={ref}
  >
    {children}
  </ReactAriaModal>
)
InternalModal.displayName = 'Modal'

const DIALOG_CLASS_NAME = 'Layer__Dialog'
const Dialog = forwardRef<
  HTMLElement,
  Omit<DialogProps, 'className'>
>((props, ref) =>
  <ReactAriaDialog
    {...props}
    className={DIALOG_CLASS_NAME}
    ref={ref}
  />
)
Dialog.displayName = 'Dialog'

type AllowedModalProps = Pick<
  ComponentProps<typeof ModalOverlay>,
  'isOpen' | 'onOpenChange'
>
type AllowedDialogProps = Pick<
  ComponentProps<typeof Dialog>,
  'children'
>

type ModalProps = AllowedModalProps & AllowedDialogProps

export function Modal({
  isOpen,
  onOpenChange,
  children
}: ModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <InternalModal>
        <Dialog role='dialog'>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

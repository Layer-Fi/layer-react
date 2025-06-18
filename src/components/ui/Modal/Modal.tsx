import { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type ModalSize = 'md' | 'lg'

const MODAL_OVERLAY_CLASS_NAME = 'Layer__ModalOverlay'
const MODAL_OVERLAY_CLASS_NAMES = `Layer__Portal ${MODAL_OVERLAY_CLASS_NAME}`

const ModalOverlay = forwardRef<
  HTMLElementTagNameMap['div'],
  Omit<ModalOverlayProps, 'className'>
>((props, ref) => (
  <ReactAriaModalOverlay
    {...props}
    className={MODAL_OVERLAY_CLASS_NAMES}
    ref={ref}
  />
),
)
ModalOverlay.displayName = 'ModalOverlay'

const MODAL_CLASS_NAME = 'Layer__Modal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  PropsWithChildren<{ size?: ModalSize, flexBlock?: boolean }>
>(({ children, flexBlock, size }, ref) => {
  const dataProperties = toDataProperties({ size, 'flex-block': flexBlock })

  return (
    <ReactAriaModal
      {...dataProperties}
      className={MODAL_CLASS_NAME}
      ref={ref}
    >
      {children}
    </ReactAriaModal>
  )
})

InternalModal.displayName = 'Modal'

const DIALOG_CLASS_NAME = 'Layer__Dialog'
const Dialog = forwardRef<
  HTMLElement,
  Omit<DialogProps, 'className'>
>(({ ...props }, ref) => (
  <ReactAriaDialog
    {...props}
    className={DIALOG_CLASS_NAME}
    ref={ref}
  />
),
)

Dialog.displayName = 'Dialog'

type AllowedModalOverlayProps = Pick<
  ComponentProps<typeof ModalOverlay>,
  'isOpen' | 'onOpenChange'
>
type AllowedInternalModalProps = Pick<
  ComponentProps<typeof InternalModal>,
  'flexBlock' | 'size'
>
type AllowedDialogProps = Pick<
  ComponentProps<typeof Dialog>,
  'children' | 'role' | 'aria-label'
>

export type ModalProps = AllowedModalOverlayProps & AllowedInternalModalProps & AllowedDialogProps

export function Modal({
  isOpen,
  size = 'md',
  flexBlock,
  onOpenChange,
  children,
  'aria-label': ariaLabel,
  role,
}: ModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <InternalModal flexBlock={flexBlock} size={size}>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel}>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

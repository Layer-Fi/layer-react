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
type ModalVariant = 'center' | 'drawer'

const BASE_MODAL_OVERLAY_CLASS_NAME = 'Layer__ModalOverlay'
const MODAL_OVERLAY_CLASS_NAME = `Layer__Portal ${BASE_MODAL_OVERLAY_CLASS_NAME}`

const ModalOverlay = forwardRef<
  HTMLElementTagNameMap['div'],
  Omit<ModalOverlayProps, 'className'> & { variant: ModalVariant }
>(({ variant, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ variant })

  return (
    <ReactAriaModalOverlay
      {...dataProperties}
      {...restProps}
      className={MODAL_OVERLAY_CLASS_NAME}
      ref={ref}
    />
  )
},
)
ModalOverlay.displayName = 'ModalOverlay'

const MODAL_CLASS_NAME = 'Layer__Modal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  PropsWithChildren<{
    size?: ModalSize
    flexBlock?: boolean
    variant?: ModalVariant
  }>
>(({ children, flexBlock, size, variant = 'center' }, ref) => {
  const dataProperties = toDataProperties({ size, 'flex-block': flexBlock, variant })

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
  Omit<DialogProps, 'className'> & { variant: ModalVariant }
>(({ variant = 'center', ...restProps }, ref) => {
  const dataProperties = toDataProperties({ variant })

  return (
    <ReactAriaDialog
      {...dataProperties}
      {...restProps}
      className={DIALOG_CLASS_NAME}
      ref={ref}
    />
  )
},
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
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant='center'>
      <InternalModal flexBlock={flexBlock} size={size} variant='center'>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant='center'>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

type AllowedInternalDrawerProps = Pick<
  ComponentProps<typeof InternalModal>,
  'size'
>

export type DrawerProps = AllowedModalOverlayProps &
  AllowedInternalDrawerProps &
  AllowedDialogProps

export function Drawer({
  isOpen,
  onOpenChange,
  size = 'md',
  children,
  'aria-label': ariaLabel,
  role,
}: DrawerProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant='drawer'>
      <InternalModal size={size} variant='drawer'>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant='drawer'>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

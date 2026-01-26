import { type ComponentProps, forwardRef, type PropsWithChildren } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  type DialogRenderProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useVirtualKeyboardHeight } from '@hooks/useVirtualKeyboardHeight/useVirtualKeyboardHeight'

import './modal.scss'

type ModalSize = 'md' | 'lg' | 'xl'
type ModalVariant = 'center' | 'drawer' | 'mobile-drawer' | 'mobile-popover'

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
    flexInline?: boolean
    variant?: ModalVariant
  }>
>(({ children, flexBlock, flexInline, size, variant = 'center' }, ref) => {
  const dataProperties = toDataProperties({ size, 'flex-block': flexBlock, 'flex-inline': flexInline, variant })

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

const MobileDrawerKeyboardSpacer = () => {
  const keyboardHeight = useVirtualKeyboardHeight()

  return <div className='Layer__Dialog__KeyboardSpacer' style={{ height: keyboardHeight }} />
}

const DIALOG_CLASS_NAME = 'Layer__Dialog'

type DialogSlots = {
  Header?: React.FC<DialogRenderProps>
}

type DialogComponentProps = Omit<DialogProps, 'className'> & {
  variant: ModalVariant
  slots?: DialogSlots
}

const Dialog = forwardRef<HTMLElement, DialogComponentProps>(
  ({ variant = 'center', children, slots, ...restProps }, ref) => {
    const dataProperties = toDataProperties({ variant })
    const Header = slots?.Header

    return (
      <ReactAriaDialog
        {...dataProperties}
        {...restProps}
        className={DIALOG_CLASS_NAME}
        ref={ref}
      >
        {(renderProps) => {
          const content = typeof children === 'function' ? children(renderProps) : children
          return (
            <>
              {Header && (
                <div className='Layer__Dialog__Header'>
                  <Header {...renderProps} />
                </div>
              )}
              <div className='Layer__Dialog__Content'>
                {content}
                {variant === 'mobile-drawer' && <MobileDrawerKeyboardSpacer />}
              </div>
            </>
          )
        }}
      </ReactAriaDialog>
    )
  },
)
Dialog.displayName = 'Dialog'

type AllowedModalOverlayProps = Pick<
  ComponentProps<typeof ModalOverlay>,
  'isOpen' | 'onOpenChange' | 'isDismissable'
>

type AllowedInternalModalProps = Pick<
  ComponentProps<typeof InternalModal>,
  'flexBlock' | 'flexInline' | 'size' | 'variant'
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
  flexInline,
  onOpenChange,
  children,
  'aria-label': ariaLabel,
  role,
  variant = 'center',
  isDismissable = false,
}: ModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant={variant} isDismissable={isDismissable}>
      <InternalModal flexBlock={flexBlock} flexInline={flexInline} size={size} variant={variant}>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant={variant}>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

type AllowedInternalDrawerProps = Pick<
  ComponentProps<typeof InternalModal>,
  'size'
> & { variant?: Extract<ModalVariant, 'drawer' | 'mobile-drawer'> }

type DrawerSlots = DialogSlots

export type DrawerProps = AllowedModalOverlayProps &
  AllowedInternalDrawerProps &
  AllowedDialogProps &
  AllowedInternalModalProps & {
    slots?: DrawerSlots
  }

export function Drawer({
  isOpen,
  onOpenChange,
  size = 'md',
  flexBlock,
  flexInline,
  children,
  slots,
  'aria-label': ariaLabel,
  variant = 'drawer',
  isDismissable = false,
  role,
}: DrawerProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant={variant} isDismissable={isDismissable}>
      <InternalModal flexBlock={flexBlock} flexInline={flexInline} size={size} variant={variant}>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant={variant} slots={slots}>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

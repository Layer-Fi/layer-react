import { type ComponentProps, forwardRef, type PropsWithChildren, useEffect, useRef } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

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

export type DrawerProps = AllowedModalOverlayProps &
  AllowedInternalDrawerProps &
  AllowedDialogProps &
  AllowedInternalModalProps

export function Drawer({
  isOpen,
  onOpenChange,
  size = 'md',
  flexBlock,
  flexInline,
  children,
  'aria-label': ariaLabel,
  variant = 'drawer',
  isDismissable = false,
  role,
}: DrawerProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen || variant !== 'mobile-drawer' || typeof window === 'undefined') return
    const root = document.documentElement
    const updateViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      root.style.setProperty('--visual-viewport-height', `${height}px`)
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLElement &&
        dialogRef.current?.contains(activeElement) &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || activeElement.isContentEditable)
      ) {
        activeElement.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
    }
    updateViewportHeight()
    const visualViewport = window.visualViewport
    visualViewport?.addEventListener('resize', updateViewportHeight)
    visualViewport?.addEventListener('scroll', updateViewportHeight)
    window.addEventListener('resize', updateViewportHeight)
    return () => {
      visualViewport?.removeEventListener('resize', updateViewportHeight)
      visualViewport?.removeEventListener('scroll', updateViewportHeight)
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [isOpen, variant])

  useEffect(() => {
    if (!isOpen || variant !== 'mobile-drawer') return
    const dialogElement = dialogRef.current
    if (!dialogElement) return
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: 'center', inline: 'nearest' })
        })
      }
    }
    dialogElement.addEventListener('focusin', handleFocusIn)
    return () => {
      dialogElement.removeEventListener('focusin', handleFocusIn)
    }
  }, [isOpen, variant])

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant={variant} isDismissable={isDismissable}>
      <InternalModal flexBlock={flexBlock} flexInline={flexInline} size={size} variant={variant}>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant={variant} ref={dialogRef}>
          {children}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}
